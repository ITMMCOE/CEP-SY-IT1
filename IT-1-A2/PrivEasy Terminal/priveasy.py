import os
import sys
import shutil
import tkinter as tk
from tkinter import filedialog
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.prompt import Prompt, Confirm, IntPrompt

from security_profile import ProfileManager
from face_recognition import (
    capture_face_images,
    train_face_recognizer,
    authenticate_face,
    reset_face_data,
)
from vault_manager import MANAGER, log_activity, get_activity_logs, VAULT_DIR, VaultManager
from crypto import encrypt_file, decrypt_file, calculate_file_hash

console = Console()
profile_manager = ProfileManager()
SESSION_KEY = None
APP_NAME = "Priveasy Vault"


def display_header():
    status = "[green]AUTHENTICATED[/green]" if SESSION_KEY else "[red]LOCKED[/red]"
    
    console.print(
        Panel(
            f"[bold yellow]{APP_NAME}[/bold yellow] | Status: {status}",
            title="🔒 Security System",
            border_style="cyan",
            expand=False,
        )
    )


def handle_authentication():
    global SESSION_KEY
    
    if SESSION_KEY:
        console.print("[bold yellow]You are already logged in.[/bold yellow]")
        return True

    if not profile_manager.is_profile_created():
        console.print("[bold red]Error: No profile found. Run option 1 to initialize.[/bold red]")
        return False

    console.print("\n--- Starting Two-Factor Authentication ---", style="bold blue")
    
    with console.status("[bold green]Factor 1: Detecting Face...[/bold green]"):
        if not authenticate_face():
            log_activity("Authentication Failed", "Face recognition failed")
            console.print("[bold red]Authentication failed: Face not recognized.[/bold red]")
            return False
    console.print("[bold green]Factor 1: Face recognized.[/bold green]")

    password = Prompt.ask("[bold magenta]Factor 2: Enter Master Password[/bold magenta]", password=True)
    if not profile_manager.verify_password(password):
        log_activity("Authentication Failed", "Password incorrect")
        console.print("[bold red]Authentication failed: Master password incorrect.[/bold red]")
        return False
        
    SESSION_KEY = profile_manager.session_key
    log_activity("Authentication Success", "Session key established")
    console.print("[bold green]Authentication successful. Session key is active.[/bold green]")
    return True


def encrypt_file_prompt():
    if not SESSION_KEY:
        console.print("[bold red]Error: You must login first.[/bold red]")
        return

    root = tk.Tk()
    root.withdraw()
    
    console.print("[bold cyan]Opening file selection dialog (Press Cancel in window to return)...[/bold cyan]")
    source_path = filedialog.askopenfilename(
        title="Select File to Encrypt",
        filetypes=[("All files", "*.*"), ("Documents", "*.txt;*.docx;*.pdf"), ("Images", "*.jpg;*.png")]
    )
    
    root.destroy() 

    if not source_path:
        console.print("[bold yellow]Encryption cancelled: No file selected.[/bold yellow]")
        return

    console.print(f"[bold green]Selected file:[/bold green] {source_path}")
    
    try:
        temp_encrypted_path = MANAGER.move_to_vault(source_path)

        with console.status(f"[bold green]Encrypting '{os.path.basename(source_path)}'...[/bold green]"):
            final_encrypted_path = encrypt_file(
                in_file=source_path, out_file=temp_encrypted_path, session_key=SESSION_KEY
            )

        with console.status("[bold yellow]Calculating SHA-256 fingerprint of encrypted file...[/bold yellow]"):
            file_hash = calculate_file_hash(final_encrypted_path)

        file_size = os.path.getsize(final_encrypted_path)
        MANAGER.add_file(source_path, final_encrypted_path, file_size, file_hash)
        MANAGER.secure_delete(source_path)
        
        log_activity("File Encrypted", os.path.basename(source_path))
        console.print(f"\n[bold green]Success![/bold green] File encrypted and secured.")

    except Exception as e:
        console.print(f"[bold red]An error occurred during encryption: {e}[/bold red]")


def decrypt_file_prompt():
    if not SESSION_KEY:
        console.print("[bold red]Error: You must login first.[/bold red]")
        return
        
    files = MANAGER.get_all_files()
    if not files:
        console.print("[bold yellow]The vault is empty. Nothing to decrypt.[/bold yellow]")
        return

    console.print("\n--- Select File for Decryption ---", style="bold magenta")
    
    selection_map = {}
    
    table = Table(show_header=True, header_style="bold cyan", title="Encrypted Files")
    table.add_column("#", style="yellow")
    table.add_column("Filename", style="green", max_width=30)
    table.add_column("Size (KB)", justify="right")

    for i, (file_id, name, size, _, path, _) in enumerate(files):
        index = i + 1
        size_kb = f"{size / 1024:.2f}"
        table.add_row(str(index), name, size_kb)
        selection_map[index] = file_id 

    console.print(table)
    
    prompt_choices = list(map(str, selection_map.keys())) + ['b']
    
    try:
        choice_str = Prompt.ask(
            "[bold cyan]Enter the number (#) of the file to decrypt or 'b' to go back[/bold cyan]",
            choices=prompt_choices,
            default='b'
        )
        if choice_str == 'b':
            console.print("[bold yellow]Decryption cancelled.[/bold yellow]")
            return
            
        choice = int(choice_str)
        
    except Exception:
        console.print("[bold red]Invalid selection. Decryption cancelled.[/bold red]")
        return

    selected_id = selection_map.get(choice)
    file_meta = MANAGER.get_file_by_id(selected_id)
    original_filename, encrypted_path, _ = file_meta
    
    root = tk.Tk()
    root.withdraw()

    console.print(f"\n[bold cyan]Opening save location dialog for: '{original_filename}' (Press Cancel in window to return)...[/bold cyan]")
    destination_path = filedialog.asksaveasfilename(
        title="Select Decryption Save Location and Filename",
        initialfile=original_filename,
        defaultextension="." + original_filename.split('.')[-1] if '.' in original_filename else "",
        filetypes=[("Original Filename", original_filename)]
    )
    
    root.destroy()
    
    if not destination_path:
        console.print("[bold yellow]Decryption cancelled: No save location selected.[/bold yellow]")
        return
    
    console.print(f"[bold green]Saving to:[/bold green] {destination_path}")

    try:
        with console.status(f"[bold green]Decrypting '{original_filename}'...[/bold green]"):
            decrypt_file(
                in_file=encrypted_path, out_file=destination_path, session_key=SESSION_KEY
            )

            MANAGER.secure_delete(encrypted_path)
            MANAGER.delete_file_record(selected_id)
        
        log_activity("File Decrypted", original_filename)
        console.print(f"\n[bold green]Success![/bold green] File decrypted and saved to '{destination_path}'")

    except Exception as e:
        console.print(f"[bold red]An error occurred during decryption: {e}[/bold red]")
        if os.path.exists(destination_path):
            os.remove(destination_path)


def run_integrity_check():
    if not SESSION_KEY:
        console.print("[bold red]Error: You must login first.[/bold red]")
        return
        
    files = MANAGER.get_all_files()
    if not files:
        console.print("[bold yellow]The vault is empty. Nothing to check.[/bold yellow]")
        return

    console.print("\n--- Running SHA-256 Integrity Check ---", style="bold red")
    
    action = Prompt.ask(
        "[bold cyan]Press ENTER to run check or 'b' to go back[/bold cyan]", 
        choices=['', 'b'],
        default=''
    )
    if action == 'b':
        console.print("[bold yellow]Check cancelled.[/bold yellow]")
        return

    tamper_count = 0
    missing_count = 0
    total_checked = len(files)
    
    table = Table(show_header=True, header_style="bold blue", title="Integrity Check Results")
    table.add_column("Filename", style="green", max_width=30)
    table.add_column("Status", style="yellow")
    table.add_column("Stored Hash", style="blue")
    
    with console.status("[bold magenta]Verifying file integrity...[/bold magenta]"):
        for _, name, _, _, path, stored_hash in files:
            hash_display = stored_hash[:8] + "..." if stored_hash else "N/A"
            
            if not os.path.exists(path):
                table.add_row(name, "[bold red]ERROR: File missing![/bold red]", hash_display)
                missing_count += 1
            else:
                current_hash = calculate_file_hash(path)
                
                if current_hash == stored_hash:
                    table.add_row(name, "[bold green]OK[/bold green]", hash_display)
                else:
                    table.add_row(name, "[bold red]TAMPERING DETECTED![/bold red]", hash_display)
                    tamper_count += 1
            
    console.print(table)
    
    if missing_count > 0:
        log_activity("Integrity Check Failed", f"{missing_count} files missing.")
        console.print(f"[bold red]WARNING: {missing_count} encrypted files are missing![/bold red]")
    if tamper_count > 0:
        log_activity("Integrity Check Failed", f"{tamper_count} files tampered.")
        console.print(f"[bold red]CRITICAL: {tamper_count} encrypted files have been tampered with![/bold red]")
    if missing_count == 0 and tamper_count == 0:
        log_activity("Integrity Check Success", f"{total_checked} files verified.")
        console.print("[bold green]Integrity check passed: All files are secure and untampered.[/bold green]")


def handle_change_password():
    global SESSION_KEY
    if not SESSION_KEY:
        console.print("[bold red]Error: You must login first to change your password.[/bold red]")
        return
        
    console.print("\n--- Master Password Change ---", style="bold magenta")
    
    def password_prompt(message, current=False):
        while True:
            result = Prompt.ask(message, password=True, default='b')
            if result == 'b':
                return 'b'
            if current and not profile_manager.verify_password(result):
                console.print("[bold red]Verification failed: Incorrect password. Try again or 'b' to go back.[/bold red]")
            else:
                return result

    old_password = password_prompt("[bold yellow]Enter CURRENT Master Password ('b' to go back)[/bold yellow]", current=True)
    if old_password == 'b':
        console.print("[bold yellow]Password change cancelled.[/bold yellow]")
        return

    new_password = Prompt.ask("[bold green]Enter NEW Master Password[/bold green]", password=True, default='b')
    if new_password == 'b':
        console.print("[bold yellow]Password change cancelled.[/bold yellow]")
        return

    confirm_password = Prompt.ask("[bold green]Confirm NEW Master Password[/bold green]", password=True, default='b')
    if confirm_password == 'b':
        console.print("[bold yellow]Password change cancelled.[/bold yellow]")
        return
        
    if new_password != confirm_password:
        console.print("[bold red]Passwords do not match. Change cancelled.[/bold red]")
        return
    
    if profile_manager.change_password(new_password):
        SESSION_KEY = profile_manager.session_key
        log_activity("Security Update", "Master password changed successfully.")
        console.print("[bold green]Success! Master password has been securely updated.[/bold green]")
    else:
        console.print("[bold red]Error: Failed to update profile file.[/bold red]")


def handle_manage_face_data():
    if not SESSION_KEY:
        console.print("[bold red]Error: You must login first.[/bold red]")
        return
        
    console.print("\n--- Manage Face Data ---", style="bold magenta")
    
    choice = Prompt.ask(
        "[bold cyan]Select action ('b' to go back)[/bold cyan]",
        choices=["re-enroll", "reset-all", "b"],
        default="b"
    )
    
    if choice == 'b':
        console.print("[bold yellow]Operation cancelled.[/bold yellow]")
        return
        
    elif choice == "re-enroll":
        if Confirm.ask("[bold yellow]Are you sure you want to capture new face data?[/bold yellow] This will overwrite the current model.", default=False):
            if capture_face_images() and train_face_recognizer():
                log_activity("Security Update", "Face model re-enrolled successfully.")
                console.print("[bold green]Face data successfully updated.[/bold green]")
            else:
                console.print("[bold red]Face re-enrollment failed.[/bold red]")
        else:
            console.print("[bold yellow]Re-enrollment cancelled.[/bold yellow]")
    
    elif choice == "reset-all":
        if Confirm.ask("[bold red]WARNING: This will permanently delete ALL face data. Continue?[/bold red]", default=False):
            reset_face_data()
            log_activity("Security Update", "Face data reset.")
            console.print("[bold green]Face data wiped. Face login is now disabled until re-enrollment.[/bold green]")
        else:
            console.print("[bold yellow]Reset cancelled.[/bold yellow]")


def list_files_menu():
    if not SESSION_KEY:
        console.print("[bold red]Error: You must login first.[/bold red]")
        return

    files = MANAGER.get_all_files()
    if not files:
        console.print("[bold yellow]The vault is currently empty.[/bold yellow]")
        return
    
    action = Prompt.ask(
        "[bold cyan]Press ENTER to view list or 'b' to go back[/bold cyan]", 
        choices=['', 'b'],
        default=''
    )
    if action == 'b':
        console.print("[bold yellow]Operation cancelled.[/bold yellow]")
        return

    table = Table(title="Vault Files", show_header=True, header_style="bold magenta")
    table.add_column("ID", style="cyan")
    table.add_column("Filename", style="green", max_width=30)
    table.add_column("Size (KB)", justify="right")
    table.add_column("Date Encrypted")
    table.add_column("Hash Fingerprint", style="blue") 

    for id, name, size, date, _, file_hash in files:
        size_kb = f"{size / 1024:.2f}"
        hash_display = file_hash[:8] + "..." if file_hash and len(file_hash) > 8 else "N/A"
        table.add_row(id, name, size_kb, date[:16], hash_display)

    console.print(table)


def view_logs_menu():
    logs = get_activity_logs()
    if not logs:
        console.print("[bold yellow]No activity logs available.[/bold yellow]")
        return
        
    action = Prompt.ask(
        "[bold cyan]Press ENTER to view logs or 'b' to go back[/bold cyan]", 
        choices=['', 'b'],
        default=''
    )
    if action == 'b':
        console.print("[bold yellow]Operation cancelled.[/bold yellow]")
        return

    table = Table(title="Activity Logs", show_header=True, header_style="bold blue")
    table.add_column("Timestamp", style="cyan", max_width=20)
    table.add_column("Event", style="yellow", max_width=20)
    table.add_column("Details", style="green")
    
    for timestamp, event, details in logs:
        table.add_row(timestamp[:19], event, details)

    console.print(table)


def handle_init_menu():
    if profile_manager.is_profile_created():
        console.print("[bold red]Error: A profile already exists. Use 'Reset All Data' to start over.[/bold red]")
        return

    console.print("\n[bold yellow]--- System Initialization (2FA Setup) ---[/bold yellow]")
    
    if not Confirm.ask("Start Face Enrollment? (Requires webcam) or 'b' to go back", default=True):
        if Prompt.ask("[bold yellow]Are you sure you want to cancel initialization? (yes/no)[/bold yellow]", choices=['yes', 'no'], default='yes') == 'yes':
            console.print("[bold red]Initialization cancelled by user.[/bold red]")
            return
    
    if not (capture_face_images() and train_face_recognizer()):
        console.print("[bold red]Enrollment aborted due to insufficient face images or failure.[/bold red]")
        return

    password = Prompt.ask("[bold magenta]Set New Master Password ('b' to go back)[/bold magenta]", password=True, default='b')
    if password == 'b':
        console.print("[bold yellow]Initialization cancelled.[/bold yellow]")
        return
        
    if profile_manager.create_profile(password):
        log_activity("Initial Setup", "Profile and Face Enrollment Complete")
        console.print("\n[bold green]SUCCESS: Profile created, face enrolled, and password set. You can now Log In.[/bold green]")
    else:
        console.print("[bold red]FATAL: Failed to create profile file.[/bold red]")


def handle_reset_menu():
    global SESSION_KEY
    global profile_manager
    global MANAGER
    
    console.print("[bold red on yellow]!!! WARNING: DANGEROUS OPERATION !!![/bold red on yellow]")
    console.print("This will delete ALL face data, ALL vault files, and the master profile. This is IRREVERSIBLE.")
    
    if not Confirm.ask("[bold red]Are you absolutely sure you want to proceed? (yes/no)[/bold red]", default=False):
        console.print("[bold yellow]Reset cancelled.[/bold yellow]")
        return

    try:
        reset_face_data()
        if os.path.exists(VAULT_DIR):
            shutil.rmtree(VAULT_DIR)
        
        MANAGER.close()
        
        if os.path.exists(profile_manager.PROFILE_FILE):
            os.remove(profile_manager.PROFILE_FILE)

        if os.path.exists(MANAGER.DB_PATH):
            os.remove(MANAGER.DB_PATH)
            
        SESSION_KEY = None
        
        profile_manager = ProfileManager()
        MANAGER = VaultManager()
        
        console.print("\n[bold green]System has been fully wiped and reset.[/bold green] You must now run [bold]Initialize System[/bold] (Option 1) to begin again.")
        
    except Exception as e:
        console.print(f"[bold red]An error occurred during reset: {e}[/bold red]")


def handle_logout():
    global SESSION_KEY
    if SESSION_KEY:
        profile_manager.clear_session()
        SESSION_KEY = None
        log_activity("Logout", "Session key cleared")
        console.print("[bold yellow]Logged out. Session key cleared from memory.[/bold yellow]")
    else:
        console.print("[bold yellow]You are not currently logged in.[/bold yellow]")


def main_menu():
    while True:
        console.clear()
        display_header()
        
        if not profile_manager.is_profile_created():
            menu_options = {
                "1": ("Initialize System (First Time Setup)", handle_init_menu),
                "0": ("Exit", lambda: sys.exit(0)),
            }
            console.print("[bold red]System not initialized. Please select 1.[/bold red]")
            
            console.print("\n--- Main Menu ---", style="bold cyan")
            for key, (label, _) in menu_options.items():
                console.print(f"[bold]{key}[/bold]: {label}")
            choice = Prompt.ask("[bold]Select an option[/bold]", choices=list(menu_options.keys()))
        elif not SESSION_KEY:
            menu_options = {
                "1": ("Log In (2FA)", handle_authentication),
                "9": ("Reset All Data", handle_reset_menu),
                "0": ("Exit", lambda: sys.exit(0)),
            }
            console.print("[bold yellow]Please Log In to access the vault.[/bold yellow]")
            
            console.print("\n--- Main Menu ---", style="bold cyan")
            for key, (label, _) in menu_options.items():
                console.print(f"[bold]{key}[/bold]: {label}")
            choice = Prompt.ask("[bold]Select an option[/bold]", choices=list(menu_options.keys()))
        else:
            menu_options = {
                "1": ("Encrypt & Store File (via Explorer)", encrypt_file_prompt),
                "2": ("Decrypt & Retrieve File (via Explorer)", decrypt_file_prompt),
                "3": ("List Vault Files (Detailed)", list_files_menu),
                "4": ("View Activity Logs", view_logs_menu),
                "5": ("Run security check", run_integrity_check),
                "6": ("Change Master Password", handle_change_password),
                "7": ("Manage Face Data", handle_manage_face_data),
                "8": ("Log Out", handle_logout),
                "9": ("Reset All Data", handle_reset_menu),
                "0": ("Exit", lambda: sys.exit(0)),
            }
            
            console.print("\n--- Main Menu ---", style="bold cyan")
            for key, (label, _) in menu_options.items():
                console.print(f"[bold]{key}[/bold]: {label}")
            
            choice = Prompt.ask("[bold]Select an option[/bold]", choices=list(menu_options.keys()))
        
        console.print("\n" + "="*50)
        
        try:
            menu_options[choice][1]()
        except Exception as e:
            console.print(f"[bold red]An unexpected error occurred: {e}[/bold red]")
            
        if choice != "0" and choice != "1" and SESSION_KEY:
             Prompt.ask("\n[bold]Press ENTER to return to the menu...[/bold]")

if __name__ == "__main__":
    try:
        main_menu()
    except KeyboardInterrupt:
        console.print("\n[bold red]Operation cancelled.[/bold red]")
    finally:
        profile_manager.clear_session()
        MANAGER.close()
        sys.exit(0)