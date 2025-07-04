﻿# 📝 Google Form Auto Filler Chrome Extension

A powerful Chrome extension that automatically fills Google Forms with your saved data. Perfect for students, professionals, and anyone who needs to fill out similar forms repeatedly.

## ✨ Features

- 🚀 **One-Click Form Filling**: Save your data once, use it everywhere
- 💾 **Smart Data Storage**: Automatically saves and syncs your form data across devices
- ⏰ **Time Management**: Easy time input with AM/PM selection
- 📅 **Date Flexibility**: Choose today's date or set a custom date
- 🎯 **Project Selection**: Quick radio button selection for different projects
- 🔄 **Real-time Sync**: Data stays in sync across all your Chrome instances
- 🎨 **Beautiful UI**: Modern, gradient-based design with smooth animations
- 🔒 **Privacy First**: All data is stored locally in Chrome's secure storage

## 📱 Interface Preview

The extension features a beautiful, modern interface with:
- Gradient background with glass-morphism effects
- Smart form validation and error handling
- Visual indicators for unsaved changes
- Smooth animations and transitions
- Responsive design that works on all screen sizes

## 🛠️ Complete Setup Guide

### Step 1: Download the Extension Files

1. **Download the Latest Release (Recommended)**
   
   🎯 **One-Click Download**: [Download Latest Release ZIP](https://github.com/angelobaricante/google-form-auto-filler/releases/download/1.0.0/google-form-auto-filler.zip)
   
   **Alternative Methods:**
   - Go to the [Releases Page](https://github.com/yourusername/google-form-filler/releases)
   - Click on the latest release
   - Download the `google-form-filler.zip` file
   
   **For Developers (Advanced):**
   ```bash
   git clone https://github.com/yourusername/google-form-filler.git
   ```

2. **Extract the Files**
   - Extract the downloaded ZIP file to a folder on your computer
   - Choose an easy-to-remember location like `Desktop` or `Documents`
   - The folder should be named `google-form-filler`

3. **Verify Files**
   Make sure you have all these files in your folder:
   ```
   📁 google-form-filler/
   ├── 📄 manifest.json
   ├── 📄 popup.html
   ├── 📄 popup.js
   ├── 📄 content.js
   └── 📄 README.md
   ```

### Step 2: Install the Extension in Chrome

1. **Open Chrome Browser**
   - Make sure you're using Google Chrome (version 88 or higher)

2. **Access Extension Management**
   - Open Chrome and go to: `chrome://extensions/`
   - Or click the three dots menu → More tools → Extensions

3. **Enable Developer Mode**
   - Look for "Developer mode" toggle in the top-right corner
   - Turn it ON (it should be blue/enabled)

4. **Load the Extension**
   - Click "Load unpacked" button (appears after enabling Developer mode)
   - Navigate to your `google-form-filler` folder
   - Select the folder and click "Select Folder"

5. **Verify Installation**
   - You should see "Google Form Auto Filler" in your extensions list
   - Make sure it's enabled (toggle should be ON)
   - Pin it to your toolbar by clicking the puzzle piece icon and clicking the pin next to the extension

### Step 3: Configure Your Form Data

1. **Open the Extension**
   - Click on the extension icon in your Chrome toolbar
   - You'll see a beautiful popup with form fields

2. **Fill in Your Default Information**
   ```
   📝 Accomplishment Report: Your regular tasks/achievements
   ⏰ Time In: Your usual start time (e.g., 8:00 AM)
   ⏰ Time Out: Your usual end time (e.g., 5:00 PM)
   👤 Name: Your full name
   📧 Email: Your email address
   🎯 Project: Select your default project (Haptics/Mr.MED/TRIOE)
   🆔 SR Code: Your student/employee code
   📚 Course: Your course name
   📅 Date: Choose "Today" or set a custom date
   ```

3. **Save Your Data**
   - The extension automatically detects changes
   - Click "💾 Save & Open" to save your data
   - You'll see a success message when data is saved

### Step 4: Get Your Google Form Entry IDs

This is the most important step to make the extension work with your specific Google Form.

1. **Open Your Google Form**
   - Go to the Google Form you want to auto-fill
   - Make sure you're viewing the form (not editing it)

2. **Open Browser Developer Tools**
   - Press `F12` or right-click anywhere and select "Inspect"
   - Go to the "Console" tab

3. **Run the Entry ID Finder Script**
   - Copy this script and paste it into the console:

   ```javascript
   console.log("🔍 Finding Entry IDs...");
   const inputs = document.querySelectorAll('input[name*="entry."], textarea[name*="entry."]');
   console.log("📝 Found Entry IDs:");
   console.log("==================");
   inputs.forEach(input => {
       const entryId = input.getAttribute('name');
       const parent = input.closest('[role="listitem"]');
       let questionText = 'Unknown field';
       if (parent) {
           const question = parent.querySelector('[role="heading"]');
           if (question) questionText = question.textContent.trim();
       }
       console.log(`${questionText}: ${entryId}`);
   });
   ```

   - Press Enter to run the script
   - You'll see a list of all entry IDs with their corresponding field names

4. **Update the Extension Code**
   - Open the `popup.js` file in your extension folder
   - Find the `entryIds` object (around line 340)
   - Replace the placeholder entry IDs with the real ones from your form

   **Example:**
   ```javascript
   const entryIds = {
       name: 'entry.451543436',        // Replace with your actual entry ID
       email: 'entry.932619041',       // Replace with your actual entry ID
       project: 'entry.2100950097',    // Replace with your actual entry ID
       srCode: 'entry.1350956555',     // Replace with your actual entry ID
       course: 'entry.2003141613',     // Replace with your actual entry ID
       accomplishment: 'entry.874447919', // Replace with your actual entry ID
       // ... continue for all fields
   };
   ```

5. **Reload the Extension**
   - Go back to `chrome://extensions/`
   - Find "Google Form Auto Filler"
   - Click the refresh/reload button

### Step 5: Test the Extension

1. **Open Your Google Form**
   - Navigate to your Google Form in a new tab

2. **Use the Extension**
   - Click the extension icon
   - Verify your saved data is displayed
   - Click "🔗 Open" (if data is saved) or "💾 Save & Open"

3. **Verify Auto-Fill**
   - A new tab should open with your form pre-filled
   - Check that all fields are correctly populated
   - If some fields aren't filled, double-check the entry IDs

## 🔧 Troubleshooting

### Form Fields Not Pre-Filling

**Problem**: The form opens but fields are empty.

**Solution:**
1. Verify you've updated the entry IDs in `popup.js`
2. Make sure the entry IDs match exactly (case-sensitive)
3. Check the browser console for error messages
4. Re-run the entry ID finder script to get fresh IDs

### Extension Not Appearing

**Problem**: Extension doesn't show up in Chrome.

**Solution:**
1. Make sure Developer mode is enabled
2. Verify all files are in the correct folder
3. Check that `manifest.json` is properly formatted
4. Try reloading the extension

### Data Not Saving

**Problem**: Form data doesn't persist between sessions.

**Solution:**
1. Check Chrome storage permissions
2. Verify the extension has proper permissions in `manifest.json`
3. Try clearing Chrome's cache and cookies for the extension

### Time Format Issues

**Problem**: Time fields not filling correctly.

**Solution:**
1. Check that your Google Form uses the same time format
2. Verify the time entry IDs are correct
3. Some forms use 24-hour format instead of 12-hour

## 📝 How It Works

### Data Flow
1. **Input**: You enter data in the extension popup
2. **Storage**: Data is saved to Chrome's sync storage
3. **URL Generation**: Extension creates pre-filled form URLs
4. **Auto-Fill**: Chrome opens the form with your data

### Technical Details
- Uses Chrome Extension Manifest V3
- Stores data in `chrome.storage.sync` for cross-device sync
- Generates pre-filled URLs using Google Forms' URL parameters
- Content script can also directly fill forms on the page

### File Structure
```
📁 Extension Files:
├── manifest.json     # Extension configuration and permissions
├── popup.html       # Extension popup interface
├── popup.js         # Main logic and form handling
└── content.js       # Form filling functionality
```

## 🎯 Supported Form Fields

The extension supports these Google Form field types:

- ✅ **Text Input**: Name, email, codes, etc.
- ✅ **Textarea**: Accomplishment reports, descriptions
- ✅ **Radio Buttons**: Project selection, options
- ✅ **Date Fields**: Single date or date components
- ✅ **Time Fields**: Time with AM/PM or 24-hour format
- ✅ **Dropdown**: Selection lists
- ⚠️ **Checkboxes**: Partially supported
- ⚠️ **File Upload**: Not supported
- ⚠️ **Scale/Grid**: Limited support

## 🔒 Privacy & Security

- **Local Storage**: All data is stored locally in your Chrome browser
- **No External Servers**: Extension doesn't send data to any external servers
- **Chrome Sync**: Data syncs across your Chrome instances using Google's secure sync
- **No Tracking**: Extension doesn't track your usage or collect analytics
- **Open Source**: All code is visible and auditable

## 🤝 Contributing

Want to improve the extension? Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Having issues? Here's how to get help:

1. **Check the Troubleshooting section** above
2. **Open an Issue** on GitHub with:
   - Chrome version
   - Error messages (if any)
   - Steps to reproduce the problem
3. **Provide Screenshots** if possible

## 🔄 Updates

### Version 1.0
- Initial release
- Basic form filling functionality
- Modern UI with glass-morphism design
- Chrome storage sync support
- Time and date handling
- Project selection with radio buttons

---

**Made with ❤️ for productivity and efficiency**

*Save time, reduce errors, and focus on what matters most!*
