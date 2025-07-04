document.addEventListener('DOMContentLoaded', function() {
    // Load saved values when popup opens
    loadSavedValues();
    
    // Save button event listener
    document.getElementById('saveBtn').addEventListener('click', saveValues);
    
    // Open button event listener
    document.getElementById('openBtn').addEventListener('click', handleOpenClick);
    
    // Add validation for time inputs
    setupTimeInputValidation('timeInHour', 'timeInMinute');
    setupTimeInputValidation('timeOutHour', 'timeOutMinute');
    
    // Add event listeners to all form inputs to track changes
    setupFormChangeTracking();
});

// Variable to track if data has been saved
let isDataSaved = true;

function setupTimeInputValidation(hourId, minuteId) {
    const hourInput = document.getElementById(hourId);
    const minuteInput = document.getElementById(minuteId);
    
    // Validate hour input
    hourInput.addEventListener('input', function() {
        let val = parseInt(this.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 12) val = 12;
        this.value = val;
    });
    
    // Validate minute input
    minuteInput.addEventListener('input', function() {
        if (this.value === '') return; // Allow empty during typing
        let val = parseInt(this.value, 10);
        if (isNaN(val) || val < 0) val = 0;
        if (val > 59) val = 59;
        this.value = val.toString().padStart(2, '0');
    });
    
    // Format on blur
    hourInput.addEventListener('blur', function() {
        if (this.value === '') {
            this.value = '1';
        } else {
            this.value = parseInt(this.value, 10);
        }
    });
    
    minuteInput.addEventListener('blur', function() {
        if (this.value === '') {
            this.value = '00';
        } else {
            this.value = parseInt(this.value, 10).toString().padStart(2, '0');
        }
    });
}

function loadSavedValues() {
    chrome.storage.sync.get([
        'name', 'email', 'project', 'srCode', 'course', 'accomplishment', 
        'timeInHour', 'timeInMinute', 'timeInAmPm', 'timeOutHour', 'timeOutMinute', 'timeOutAmPm'
    ], function(result) {
        document.getElementById('name').value = result.name || '';
        document.getElementById('email').value = result.email || '';
        document.getElementById('project').value = result.project || '';
        document.getElementById('srCode').value = result.srCode || '';
        document.getElementById('course').value = result.course || '';
        document.getElementById('accomplishment').value = result.accomplishment || '';
        
        // Time in fields
        document.getElementById('timeInHour').value = result.timeInHour || '8';
        document.getElementById('timeInMinute').value = result.timeInMinute || '00';
        document.getElementById('timeInAmPm').value = result.timeInAmPm || 'AM';
        
        // Time out fields
        document.getElementById('timeOutHour').value = result.timeOutHour || '5';
        document.getElementById('timeOutMinute').value = result.timeOutMinute || '00';
        document.getElementById('timeOutAmPm').value = result.timeOutAmPm || 'PM';
        
        // Mark data as saved since it was loaded from storage
        markDataAsSaved();
    });
}

function saveValues() {
    const values = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        project: document.getElementById('project').value,
        srCode: document.getElementById('srCode').value,
        course: document.getElementById('course').value,
        accomplishment: document.getElementById('accomplishment').value,
        
        // Time in values
        timeInHour: document.getElementById('timeInHour').value,
        timeInMinute: document.getElementById('timeInMinute').value,
        timeInAmPm: document.getElementById('timeInAmPm').value,
        
        // Time out values
        timeOutHour: document.getElementById('timeOutHour').value,
        timeOutMinute: document.getElementById('timeOutMinute').value,
        timeOutAmPm: document.getElementById('timeOutAmPm').value
    };
    
    chrome.storage.sync.set(values, function() {
        showStatus('Values saved successfully!', 'success');
        markDataAsSaved();
    });
}

function openPrefilledForm() {
    // Get time values and format them
    let timeInHour = document.getElementById('timeInHour').value;
    timeInHour = timeInHour ? String(timeInHour).padStart(2, '0') : '08';
    
    let timeInMinute = document.getElementById('timeInMinute').value;
    timeInMinute = timeInMinute ? String(timeInMinute).padStart(2, '0') : '00';
    
    const timeInAmPm = document.getElementById('timeInAmPm').value || 'AM';
    const timeIn = `${timeInHour}:${timeInMinute} ${timeInAmPm}`;
    
    let timeOutHour = document.getElementById('timeOutHour').value;
    timeOutHour = timeOutHour ? String(timeOutHour).padStart(2, '0') : '05';
    
    let timeOutMinute = document.getElementById('timeOutMinute').value;
    timeOutMinute = timeOutMinute ? String(timeOutMinute).padStart(2, '0') : '00';
    
    const timeOutAmPm = document.getElementById('timeOutAmPm').value || 'PM';
    const timeOut = `${timeOutHour}:${timeOutMinute} ${timeOutAmPm}`;
    
    // Get today's date in MM/DD/YYYY format (for Google Forms)
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;
    
    // Get all form values
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        project: document.getElementById('project').value.trim(),
        srCode: document.getElementById('srCode').value.trim(),
        course: document.getElementById('course').value.trim(),
        accomplishment: document.getElementById('accomplishment').value.trim(),
        date: formattedDate,
        timeIn: timeIn,
        timeOut: timeOut
    };
    
    console.log('Form data:', formData);
    
    // Base Google Form URL
    const baseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSeWjsupbIgaoLNWtSulBDK-ntWgwoUT1LVZIv5OLNp7VAE3mw/viewform';
    
    // Entry IDs mapping (These need to be updated with actual entry IDs from the form)
    // To find entry IDs:
    // 1. Open the Google Form
    // 2. Fill it out manually
    // 3. Look at the URL or inspect the form elements
    // 4. Replace the placeholder IDs below with actual entry IDs
    
    // 🚨 IMPORTANT: Replace these placeholder entry IDs with the real ones from your Google Form
    // To find real entry IDs: Right-click on each form field → Inspect → Look for name="entry.XXXXXX"
    const entryIds = {
        name: 'entry.451543436',        // Name field
        email: 'entry.932619041',       // Email field
        project: 'entry.2100950097',    // Project field (radio button - removed _sentinel)
        srCode: 'entry.1350956555',     // SR-Code field
        course: 'entry.2003141613',     // Course field
        accomplishment: 'entry.874447919', // Accomplishment Report field
        
        // Date field (compound field with year/month/day)
        dateYear: 'entry.203318854_year',
        dateMonth: 'entry.203318854_month',
        dateDay: 'entry.203318854_day',
        
        // Time In field (compound field with hour/minute)
        timeInHour: 'entry.1371311119_hour',
        timeInMinute: 'entry.1371311119_minute',
        
        // Time Out field (compound field with hour/minute)
        timeOutHour: 'entry.922592635_hour',
        timeOutMinute: 'entry.922592635_minute'
    };
    
    console.log('🔍 Current Entry IDs being used:', entryIds);
    console.log('⚠️  If form is not pre-filled, these entry IDs need to be updated with real ones from the Google Form');
    
    // Test if entry IDs are still placeholders
    const isUsingPlaceholders = Object.values(entryIds).some(id => id.includes('123456789'));
    if (isUsingPlaceholders) {
        console.log('🚨 WARNING: Still using placeholder entry IDs! Form will NOT be pre-filled.');
        console.log('📋 Follow the instructions in the comments below to get real entry IDs.');
        showStatus('⚠️ Using placeholder entry IDs - form will not be pre-filled', 'error');
    } else {
        console.log('✅ Using real entry IDs - form should be pre-filled correctly!');
    }
    
    // Create URL with pre-filled data
    const params = new URLSearchParams({
        'usp': 'pp_url'
    });
    
    // Add form data as parameters
    if (formData.name) params.append(entryIds.name, formData.name);
    if (formData.email) params.append(entryIds.email, formData.email);
    if (formData.project) params.append(entryIds.project, formData.project);
    if (formData.srCode) params.append(entryIds.srCode, formData.srCode);
    if (formData.course) params.append(entryIds.course, formData.course);
    if (formData.accomplishment) params.append(entryIds.accomplishment, formData.accomplishment);
    
    // Handle date field (MM/DD/YYYY format)
    if (formData.date) {
        const dateParts = formData.date.split('/');
        if (dateParts.length === 3) {
            params.append(entryIds.dateMonth, dateParts[0]);  // MM
            params.append(entryIds.dateDay, dateParts[1]);    // DD
            params.append(entryIds.dateYear, dateParts[2]);   // YYYY
        }
    }
    
    // Handle time in field (HH:MM AM/PM format)
    if (formData.timeIn) {
        const timeInParts = formData.timeIn.split(' ');
        if (timeInParts.length === 2) {
            const timeParts = timeInParts[0].split(':');
            if (timeParts.length === 2) {
                let hour = parseInt(timeParts[0]);
                const minute = timeParts[1];
                const ampm = timeInParts[1];
                
                // Convert to 24-hour format for Google Forms
                if (ampm.toUpperCase() === 'PM' && hour !== 12) {
                    hour += 12;
                } else if (ampm.toUpperCase() === 'AM' && hour === 12) {
                    hour = 0;
                }
                
                params.append(entryIds.timeInHour, hour.toString());
                params.append(entryIds.timeInMinute, minute);
            }
        }
    }
    
    // Handle time out field (HH:MM AM/PM format)
    if (formData.timeOut) {
        const timeOutParts = formData.timeOut.split(' ');
        if (timeOutParts.length === 2) {
            const timeParts = timeOutParts[0].split(':');
            if (timeParts.length === 2) {
                let hour = parseInt(timeParts[0]);
                const minute = timeParts[1];
                const ampm = timeOutParts[1];
                
                // Convert to 24-hour format for Google Forms
                if (ampm.toUpperCase() === 'PM' && hour !== 12) {
                    hour += 12;
                } else if (ampm.toUpperCase() === 'AM' && hour === 12) {
                    hour = 0;
                }
                
                params.append(entryIds.timeOutHour, hour.toString());
                params.append(entryIds.timeOutMinute, minute);
            }
        }
    }
    
    const prefilledUrl = `${baseUrl}?${params.toString()}`;
    
    // Also create a simple test URL with just basic text fields
    const testParams = new URLSearchParams({'usp': 'pp_url'});
    if (formData.name) testParams.append(entryIds.name, formData.name);
    if (formData.email) testParams.append(entryIds.email, formData.email);
    if (formData.srCode) testParams.append(entryIds.srCode, formData.srCode);
    if (formData.course) testParams.append(entryIds.course, formData.course);
    if (formData.accomplishment) testParams.append(entryIds.accomplishment, formData.accomplishment);
    
    const simpleTestUrl = `${baseUrl}?${testParams.toString()}`;
    
    console.log('📋 Form Data to Send:', formData);
    console.log('🔗 Full Pre-filled URL:', prefilledUrl);
    console.log('🧪 Simple Test URL (text fields only):', simpleTestUrl);
    console.log('📝 Full URL Parameters:', params.toString());
    console.log('🧪 Test URL Parameters:', testParams.toString());
    console.log('📋 Individual Parameters:');
    for (const [key, value] of params) {
        console.log(`  ${key}: ${value}`);
    }
    
    // Debug compound fields
    if (formData.date) {
        console.log('📅 Date field parsing:');
        const dateParts = formData.date.split('/');
        console.log(`  Original: ${formData.date}`);
        console.log(`  Month: ${dateParts[0]}`);
        console.log(`  Day: ${dateParts[1]}`);
        console.log(`  Year: ${dateParts[2]}`);
    }
    
    if (formData.timeIn) {
        console.log('🕐 Time In field parsing:');
        const timeInParts = formData.timeIn.split(' ');
        console.log(`  Original: ${formData.timeIn}`);
        if (timeInParts.length === 2) {
            const timeParts = timeInParts[0].split(':');
            console.log(`  Hour: ${timeParts[0]}`);
            console.log(`  Minute: ${timeParts[1]}`);
            console.log(`  AM/PM: ${timeInParts[1]}`);
        }
    }
    
    if (formData.timeOut) {
        console.log('🕐 Time Out field parsing:');
        const timeOutParts = formData.timeOut.split(' ');
        console.log(`  Original: ${formData.timeOut}`);
        if (timeOutParts.length === 2) {
            const timeParts = timeOutParts[0].split(':');
            console.log(`  Hour: ${timeParts[0]}`);
            console.log(`  Minute: ${timeParts[1]}`);
            console.log(`  AM/PM: ${timeOutParts[1]}`);
        }
    }
    
    console.log('📝 Note: To get actual entry IDs, inspect the Google Form HTML or check the network tab when submitting the form.');
    console.log('⚠️  If the form is not pre-filled, the entry IDs above need to be updated with real ones from your Google Form');
    
    // Show success status
    showStatus('Opening pre-filled form...', 'success');
    
    // Open the pre-filled form in a new tab
    chrome.tabs.create({
        url: prefilledUrl,
        active: true
    });
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = type;
    
    // Clear status after 3 seconds
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = '';
    }, 3000);
}

function setupFormChangeTracking() {
    // Get all form inputs
    const inputs = [
        'name', 'email', 'project', 'srCode', 'course', 'accomplishment',
        'timeInHour', 'timeInMinute', 'timeInAmPm', 'timeOutHour', 'timeOutMinute', 'timeOutAmPm'
    ];
    
    // Add event listeners to track changes
    inputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', markDataAsUnsaved);
            element.addEventListener('change', markDataAsUnsaved);
        }
    });
}

function markDataAsUnsaved() {
    isDataSaved = false;
    updateOpenButtonState();
    updateUnsavedIndicator();
}

function markDataAsSaved() {
    isDataSaved = true;
    updateOpenButtonState();
    updateUnsavedIndicator();
}

function updateOpenButtonState() {
    const openBtn = document.getElementById('openBtn');
    if (isDataSaved) {
        openBtn.disabled = false;
        openBtn.style.opacity = '1';
        openBtn.style.cursor = 'pointer';
        openBtn.title = 'Open pre-filled form';
    } else {
        openBtn.disabled = true;
        openBtn.style.opacity = '0.5';
        openBtn.style.cursor = 'not-allowed';
        openBtn.title = 'Please save your data first';
    }
}

function updateUnsavedIndicator() {
    const indicator = document.getElementById('unsavedIndicator');
    if (indicator) {
        indicator.style.display = isDataSaved ? 'none' : 'inline';
    }
}

function handleOpenClick(event) {
    if (!isDataSaved) {
        event.preventDefault();
        showStatus('⚠️ Please save your data first before opening the form!', 'error');
        return;
    }
    openPrefilledForm();
}

/*
🔍 ENTRY ID FINDER SCRIPT
Copy and paste this script in the browser console on your Google Form page:

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
console.log("\n📋 Copy these entry IDs to popup.js:");
let code = "const entryIds = {\n";
inputs.forEach(input => {
    const entryId = input.getAttribute('name');
    const parent = input.closest('[role="listitem"]');
    let questionText = '';
    if (parent) {
        const question = parent.querySelector('[role="heading"]');
        if (question) questionText = question.textContent.trim().toLowerCase();
    }
    let fieldName = 'unknown';
    if (questionText.includes('name')) fieldName = 'name';
    else if (questionText.includes('email')) fieldName = 'email';
    else if (questionText.includes('project')) fieldName = 'project';
    else if (questionText.includes('sr') && questionText.includes('code')) fieldName = 'srCode';
    else if (questionText.includes('course')) fieldName = 'course';
    else if (questionText.includes('date')) fieldName = 'date';
    else if (questionText.includes('time') && questionText.includes('in')) fieldName = 'timeIn';
    else if (questionText.includes('time') && questionText.includes('out')) fieldName = 'timeOut';
    else if (questionText.includes('accomplishment') || questionText.includes('report')) fieldName = 'accomplishment';
    code += `    ${fieldName}: '${entryId}',\n`;
});
code += "};";
console.log(code);
*/