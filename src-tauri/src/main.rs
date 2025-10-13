#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::fs;
use std::path::Path;
use std::process::Command;

#[tauri::command]
fn read_goods_data(data_dir: String) -> Result<String, String> {
    let file_path = format!("{}/goodsData.json", data_dir);
    
    // 检查目录是否存在
    let dir_path = std::path::Path::new(&data_dir);
    if !dir_path.exists() {
        eprintln!("[Rust] 数据目录不存在: {}", data_dir);
        return Ok("[]".to_string());
    }
    
    // 检查文件是否存在
    let path = std::path::Path::new(&file_path);
    if !path.exists() {
        eprintln!("[Rust] 文件不存在: {}，返回空数组", file_path);
        return Ok("[]".to_string());
    }
    
    match fs::read_to_string(&file_path) {
        Ok(content) => {
            println!("[Rust] 成功读取文件，长度: {}", content.len());
            Ok(content)
        },
        Err(e) => {
            eprintln!("[Rust] 读取文件失败: {} ({})", e, file_path);
            Ok("[]".to_string())
        }
    }
}

#[tauri::command]
fn save_goods_data(data_dir: String, data: String) -> Result<(), String> {
    let file_path = format!("{}/goodsData.json", data_dir);
    
    // 确保目录存在
    if let Some(parent) = Path::new(&file_path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    
    fs::write(&file_path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn read_storage_data(data_dir: String) -> Result<String, String> {
    let file_path = format!("{}/storageData.json", data_dir);
    
    // 检查目录是否存在
    let dir_path = std::path::Path::new(&data_dir);
    if !dir_path.exists() {
        eprintln!("[Rust] 数据目录不存在: {}", data_dir);
        return Ok("[]".to_string());
    }
    
    // 检查文件是否存在
    let path = std::path::Path::new(&file_path);
    if !path.exists() {
        eprintln!("[Rust] 文件不存在: {}，返回空数组", file_path);
        return Ok("[]".to_string());
    }
    
    match fs::read_to_string(&file_path) {
        Ok(content) => {
            println!("[Rust] 成功读取文件，长度: {}", content.len());
            Ok(content)
        },
        Err(e) => {
            eprintln!("[Rust] 读取文件失败: {} ({})", e, file_path);
            Ok("[]".to_string())
        }
    }
}

#[tauri::command]
fn save_storage_data(data_dir: String, data: String) -> Result<(), String> {
    let file_path = format!("{}/storageData.json", data_dir);
    
    // 确保目录存在
    if let Some(parent) = Path::new(&file_path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    
    fs::write(&file_path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn open_local_file() -> Result<String, String> {
    // 这里可以实现文件选择对话框
    // 为简化，我们返回一个默认路径
    Ok("".to_string())
}

#[tauri::command]
fn init_git_repo(repo_url: String, data_dir: String) -> Result<String, String> {
    // 检查目录是否存在，不存在则创建
    if !Path::new(&data_dir).exists() {
        fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    }
    
    // 检查是否已经是一个 Git 仓库
    let git_dir = format!("{}/.git", data_dir);
    if !Path::new(&git_dir).exists() {
        // 初始化 Git 仓库
        let output = Command::new("git")
            .current_dir(&data_dir)
            .arg("init")
            .output()
            .map_err(|e| e.to_string())?;
            
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
    }
    
    // 添加远程仓库
    let output = Command::new("git")
        .current_dir(&data_dir)
        .arg("remote")
        .arg("add")
        .arg("origin")
        .arg(&repo_url)
        .output()
        .map_err(|e| e.to_string())?;
        
    if !output.status.success() {
        // 如果远程仓库已存在，尝试更新 URL
        let update_output = Command::new("git")
            .current_dir(&data_dir)
            .arg("remote")
            .arg("set-url")
            .arg("origin")
            .arg(&repo_url)
            .output()
            .map_err(|e| e.to_string())?;
            
        if !update_output.status.success() {
            return Err(String::from_utf8_lossy(&update_output.stderr).to_string());
        }
    }
    
    Ok("Git repository initialized successfully".to_string())
}

#[tauri::command]
fn git_add_commit_push(data_dir: String, commit_message: String) -> Result<String, String> {
    // git add goodsData.json
    let output = Command::new("git")
        .current_dir(&data_dir)
        .arg("add")
        .arg("goodsData.json")
        .output()
        .map_err(|e| e.to_string())?;
    
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    // git commit
    let output = Command::new("git")
        .current_dir(&data_dir)
        .arg("commit")
        .arg("-m")
        .arg(&commit_message)
        .output()
        .map_err(|e| e.to_string())?;
    
    if !output.status.success() {
        // 检查是否是因为没有更改
        let stderr = String::from_utf8_lossy(&output.stderr);
        if stderr.contains("nothing to commit") {
            return Ok("No changes to commit".to_string());
        }
        return Err(stderr.to_string());
    }
    
    // git push
    let output = Command::new("git")
        .current_dir(&data_dir)
        .arg("push")
        .arg("origin")
        .arg("main")
        .output()
        .map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok("Changes committed and pushed successfully".to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn git_pull(data_dir: String) -> Result<String, String> {
    let output = Command::new("git")
        .current_dir(&data_dir)
        .arg("pull")
        .arg("origin")
        .arg("main")
        .output()
        .map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok("Git pull successful".to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn get_data_dir() -> Result<String, String> {
    println!("[Rust] 开始获取数据目录");
    
    // 获取用户数据目录
    let base_dir = dirs::data_dir().ok_or("无法获取系统数据目录".to_string())?;
    let data_dir = base_dir.join("goods-reminder");
    
    println!("[Rust] 基础数据目录: {:?}", base_dir);
    println!("[Rust] 应用数据目录: {:?}", data_dir);
    
    // 确保目录存在
    if let Err(e) = fs::create_dir_all(&data_dir) {
        eprintln!("[Rust] 创建目录失败: {}", e);
        return Err(e.to_string());
    }
    
    let result = data_dir.to_string_lossy().to_string();
    println!("[Rust] 最终返回目录: {}", result);
    Ok(result)
}

#[tauri::command]
fn get_git_remote_url(data_dir: String) -> Result<String, String> {
    let output = Command::new("git")
        .current_dir(&data_dir)
        .arg("remote")
        .arg("get-url")
        .arg("origin")
        .output()
        .map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_goods_data,
            save_goods_data,
            open_local_file,
            init_git_repo,
            git_add_commit_push,
            git_pull,
            get_data_dir,
            get_git_remote_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}