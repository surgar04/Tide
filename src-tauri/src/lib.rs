use std::fs;
use std::path::PathBuf;
use tauri::Manager;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Activity {
    id: String,
    action: String,
    target: String,
    timestamp: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct UserData {
    username: Option<String>,
    email: Option<String>,
    #[serde(rename = "joinDate")]
    join_date: Option<String>,
    #[serde(rename = "totalTime")]
    total_time: i64,
    avatar: Option<String>,
    signature: Option<String>,
    activities: Vec<Activity>,
}

impl Default for UserData {
    fn default() -> Self {
        Self {
            username: Some("Administrator".to_string()),
            email: Some("admin@tideoa.com".to_string()),
            join_date: Some(chrono::Utc::now().to_rfc3339()),
            total_time: 0,
            avatar: None,
            signature: Some("Per aspera ad astra.".to_string()),
            activities: vec![],
        }
    }
}

fn get_data_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let app_data_dir = app_handle.path().app_data_dir().expect("failed to get app data dir");
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
    }
    app_data_dir.join("user_data.json")
}

#[tauri::command]
fn get_user_data(app_handle: tauri::AppHandle) -> Result<UserData, String> {
    let data_path = get_data_path(&app_handle);
    if !data_path.exists() {
        let initial_data = UserData::default();
        let json = serde_json::to_string_pretty(&initial_data).map_err(|e| e.to_string())?;
        fs::write(&data_path, json).map_err(|e| e.to_string())?;
        return Ok(initial_data);
    }

    let content = fs::read_to_string(&data_path).map_err(|e| e.to_string())?;
    let mut data: UserData = serde_json::from_str(&content).unwrap_or_else(|_| UserData::default());
    
    // Ensure joinDate is set
    if data.join_date.is_none() {
        data.join_date = Some(chrono::Utc::now().to_rfc3339());
        let _ = save_user_data(app_handle, data.clone());
    }
    
    Ok(data)
}

#[tauri::command]
fn save_user_data(app_handle: tauri::AppHandle, data: UserData) -> Result<(), String> {
    let data_path = get_data_path(&app_handle);
    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    fs::write(data_path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn log_activity(app_handle: tauri::AppHandle, action: String, target: String) -> Result<(), String> {
    let mut data = get_user_data(app_handle.clone())?;
    
    let new_activity = Activity {
        id: chrono::Utc::now().timestamp_millis().to_string(),
        action,
        target,
        timestamp: chrono::Utc::now().to_rfc3339(),
    };
    
    let mut activities = vec![new_activity];
    activities.extend(data.activities);
    data.activities = activities.into_iter().take(50).collect();
    
    save_user_data(app_handle, data)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
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
    .invoke_handler(tauri::generate_handler![get_user_data, save_user_data, log_activity])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
