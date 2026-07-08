use std::fs;
use std::path::PathBuf;

const DEFAULT_PLAN: &str = r#"{"version":1,"settings":{"theme":"system","defaultView":"dashboard","jira":{"enabled":false,"baseUrl":"","email":"","apiToken":"","projectKey":"","issueType":"Task"}},"projects":[],"tasks":[]}"#;

fn plan_dir() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("PlanBoard")
}

fn plan_path() -> PathBuf {
    plan_dir().join("plan.json")
}

fn ensure_plan_dir() -> Result<(), String> {
    let dir = plan_dir();
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn load_plan() -> Result<String, String> {
    ensure_plan_dir()?;
    let path = plan_path();

    if !path.exists() {
        fs::write(&path, DEFAULT_PLAN).map_err(|e| e.to_string())?;
        return Ok(DEFAULT_PLAN.to_string());
    }

    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_plan(data: String) -> Result<(), String> {
    ensure_plan_dir()?;
    let path = plan_path();
    let bak_path = plan_dir().join("plan.json.bak");

    if path.exists() {
        if let Ok(content) = fs::read_to_string(&path) {
            let _ = fs::write(&bak_path, content);
        }
    }

    fs::write(&path, data).map_err(|e| e.to_string())
}

#[tauri::command]
fn export_plan(app: tauri::AppHandle, data: String) -> Result<(), String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .add_filter("JSON", &["json"])
        .set_file_name("plan-export.json")
        .blocking_save_file();

    match file_path {
        Some(path) => {
            fs::write(path.to_string(), data).map_err(|e| e.to_string())
        }
        None => Ok(()),
    }
}

#[derive(serde::Serialize)]
struct JiraExportResult {
    #[serde(rename = "issueKey")]
    issue_key: String,
    #[serde(rename = "issueUrl")]
    issue_url: String,
}

#[tauri::command]
async fn create_jira_issue(
    base_url: String,
    email: String,
    api_token: String,
    project_key: String,
    issue_type: String,
    summary: String,
    description: String,
    deadline: Option<String>,
) -> Result<JiraExportResult, String> {
    use base64::{engine::general_purpose::STANDARD, Engine as _};

    let auth = STANDARD.encode(format!("{email}:{api_token}"));
    let url = format!("{}/rest/api/3/issue", base_url.trim_end_matches('/'));

    let mut fields = serde_json::json!({
        "project": { "key": project_key },
        "summary": summary,
        "issuetype": { "name": issue_type },
        "description": {
            "type": "doc",
            "version": 1,
            "content": [{
                "type": "paragraph",
                "content": [{ "type": "text", "text": description }]
            }]
        }
    });

    if let Some(due) = deadline.filter(|d| !d.is_empty()) {
        fields["duedate"] = serde_json::Value::String(due);
    }

    let body = serde_json::json!({ "fields": fields });

    let client = reqwest::Client::new();
    let response = client
        .post(&url)
        .header("Authorization", format!("Basic {auth}"))
        .header("Accept", "application/json")
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Сеть: {e}"))?;

    let status = response.status();
    let text = response.text().await.map_err(|e| e.to_string())?;

    if !status.is_success() {
        return Err(format!("Jira {status}: {text}"));
    }

    let json: serde_json::Value =
        serde_json::from_str(&text).map_err(|e| format!("Ответ Jira: {e}"))?;

    let issue_key = json
        .get("key")
        .and_then(|v| v.as_str())
        .ok_or_else(|| format!("Нет ключа задачи в ответе: {text}"))?
        .to_string();

    let issue_url = format!(
        "{}/browse/{}",
        base_url.trim_end_matches('/'),
        issue_key
    );

    Ok(JiraExportResult {
        issue_key,
        issue_url,
    })
}

#[tauri::command]
fn get_plan_path() -> Result<String, String> {
    Ok(plan_path().to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_plan,
            save_plan,
            export_plan,
            get_plan_path,
            create_jira_issue
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
