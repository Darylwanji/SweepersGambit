function closeWindow() {
    // Try multiple methods of closing the window
    try {
        // Try the standard close method first
        const closed = window.close();
        
        // If window.close() returns false or undefined, try alternative methods
        if (!closed) {
            // Try closing if it's a popup window
            if (window.opener) {
                window.close();
            }
            
            // If we reach here, show a message to the user
            alert("This window cannot be closed automatically. Please close it manually or click OK to return to the main menu.");
            window.location.href = 'index.html';
        }
    } catch (e) {
        // If any errors occur, fallback to returning to main menu
        alert("Unable to close window. Returning to main menu.");
        window.location.href = 'index.html';
    }
}