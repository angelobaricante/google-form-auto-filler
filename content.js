// Content script to interact with Google Forms
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'fillForm') {
        try {
            fillGoogleForm(request.data);
            sendResponse({success: true});
        } catch (error) {
            console.error('Error filling form:', error);
            sendResponse({success: false, error: error.message});
        }
    }
    return true; // Keep message channel open for async response
});

function fillGoogleForm(data) {
    console.log('Filling Google Form with data:', data);
    
    // Wait a moment for the form to fully load
    setTimeout(() => {
        // Get all form sections/items
        const formItems = document.querySelectorAll('[role="listitem"], .freebirdFormviewerViewItemsItemItem');
        
        console.log('Found form items:', formItems.length);
        
        formItems.forEach((item, index) => {
            console.log(`Processing item ${index}:`, item);
            const label = getItemLabel(item);
            const labelLower = label.toLowerCase();
            
            console.log(`Item ${index} label: "${label}"`);
            
            // Find inputs within this item
            const textInput = item.querySelector('input[type="text"], input[type="email"], textarea');
            const dateInput = item.querySelector('input[type="date"]');
            const timeInput = item.querySelector('input[type="time"]');
            const radioButtons = item.querySelectorAll('input[type="radio"]');
            
            // Name field
            if (labelLower.includes('name') && !labelLower.includes('project') && !labelLower.includes('course')) {
                if (textInput) {
                    console.log('Filling name field');
                    fillInput(textInput, data.name);
                }
            }
            // Email field
            else if (labelLower.includes('email')) {
                if (textInput) {
                    console.log('Filling email field');
                    fillInput(textInput, data.email);
                }
            }
            // Project field (radio button)
            else if (labelLower.includes('project')) {
                console.log('Processing project field');
                let radioFilled = false;
                
                // First try with regular radio buttons
                if (radioButtons.length > 0) {
                    console.log('Filling project radio button with regular method');
                    radioFilled = fillRadioButton(radioButtons, data.project);
                }
                
                // If no radio buttons found or filling failed, try alternative methods
                if (!radioFilled) {
                    console.log('Trying alternative radio button selection');
                    radioFilled = findAndFillRadioButton(item, data.project);
                }
                
                // If still no success, try as text input
                if (!radioFilled && textInput) {
                    console.log('Filling project as text field');
                    fillInput(textInput, data.project);
                }
            }
            // SR Code field
            else if ((labelLower.includes('sr') && labelLower.includes('code')) || labelLower.includes('sr code')) {
                if (textInput) {
                    console.log('Filling SR code field');
                    fillInput(textInput, data.srCode);
                }
            }
            // Course field
            else if (labelLower.includes('course')) {
                if (textInput) {
                    console.log('Filling course field');
                    fillInput(textInput, data.course);
                }
            }
            // Date field
            else if (labelLower.includes('date')) {
                if (dateInput) {
                    console.log('Filling date field');
                    fillInput(dateInput, data.date);
                } else if (textInput) {
                    console.log('Filling date text field');
                    fillInput(textInput, data.date);
                }
            }
            // Time In field
            else if (labelLower.includes('time') && labelLower.includes('in')) {
                handleTimeField(item, data.timeIn);
            }
            // Time Out field
            else if (labelLower.includes('time') && labelLower.includes('out')) {
                handleTimeField(item, data.timeOut);
            }
            // Accomplishment field
            else if (labelLower.includes('accomplishment') || labelLower.includes('report')) {
                if (textInput) {
                    console.log('Filling accomplishment field');
                    fillInput(textInput, data.accomplishment);
                }
            }
        });
        
        // Fallback: try to fill by all available inputs if items approach didn't work
        fillByInputs(data);
        
    }, 1000);
}

function getItemLabel(item) {
    // Try multiple methods to get the item label
    let label = '';
    
    // Method 1: Look for the question title (most common in Google Forms)
    const titleElement = item.querySelector('[role="heading"], .freebirdFormviewerViewItemsItemItemTitle, .freebirdFormviewerViewItemsItemItemTitleContainer span');
    if (titleElement) {
        label = titleElement.textContent.trim();
    }
    
    // Method 2: Look for aria-label on the item
    if (!label && item.getAttribute('aria-label')) {
        label = item.getAttribute('aria-label');
    }
    
    // Method 3: Look for any text content that might be a label
    if (!label) {
        const textElements = item.querySelectorAll('span, div');
        for (let textElement of textElements) {
            const text = textElement.textContent.trim();
            if (text && text.length > 2 && text.length < 100) {
                label = text;
                break;
            }
        }
    }
    
    return label;
}

function findAndFillRadioButton(formItem, targetValue) {
    console.log('Finding radio button for value:', targetValue);
    
    if (!targetValue || targetValue.trim() === '') {
        console.log('No target value provided');
        return false;
    }
    
    // Try multiple selectors to find radio buttons in Google Forms
    const radioSelectors = [
        'input[type="radio"]',
        '[role="radio"]',
        '.freebirdFormviewerViewItemsRadioChoice input[type="radio"]',
        '.freebirdFormviewerViewItemsRadioChoice [role="radio"]',
        '[data-value] input[type="radio"]',
        '[jsname] input[type="radio"]'
    ];
    
    let radioButtons = [];
    
    // Try each selector until we find radio buttons
    for (const selector of radioSelectors) {
        radioButtons = formItem.querySelectorAll(selector);
        if (radioButtons.length > 0) {
            console.log(`Found ${radioButtons.length} radio buttons with selector: ${selector}`);
            break;
        }
    }
    
    if (radioButtons.length === 0) {
        console.log('No radio buttons found in this item');
        return false;
    }
    
    // Try to select the appropriate radio button
    return fillRadioButton(radioButtons, targetValue);
}

function fillRadioButton(radioButtons, value) {
    console.log('Looking for radio button with value:', value);
    
    if (!value || value.trim() === '') {
        console.log('No value provided for radio button');
        return false;
    }
    
    const targetValue = value.toLowerCase().trim();
    console.log('Target value (normalized):', targetValue);
    
    // First, try to find radio button by exact match
    for (let radio of radioButtons) {
        const radioLabel = getRadioLabel(radio);
        console.log('Radio label:', radioLabel);
        
        if (radioLabel.toLowerCase().trim() === targetValue) {
            console.log('Found exact match radio button, clicking:', radioLabel);
            selectRadioButton(radio);
            return true;
        }
    }
    
    // Second, try to find by contains match
    for (let radio of radioButtons) {
        const radioLabel = getRadioLabel(radio);
        
        if (radioLabel.toLowerCase().includes(targetValue)) {
            console.log('Found containing match radio button, clicking:', radioLabel);
            selectRadioButton(radio);
            return true;
        }
    }
    
    // Third, try partial match with first word
    const firstWord = targetValue.split(' ')[0];
    if (firstWord && firstWord.length > 2) {
        for (let radio of radioButtons) {
            const radioLabel = getRadioLabel(radio);
            
            if (radioLabel.toLowerCase().includes(firstWord)) {
                console.log('Found partial match radio button, clicking:', radioLabel);
                selectRadioButton(radio);
                return true;
            }
        }
    }
    
    // Fourth, try to match by starting letters (for cases like "Haptics" vs "Hap")
    for (let radio of radioButtons) {
        const radioLabel = getRadioLabel(radio);
        
        if (radioLabel.toLowerCase().startsWith(targetValue) || 
            targetValue.startsWith(radioLabel.toLowerCase())) {
            console.log('Found start match radio button, clicking:', radioLabel);
            selectRadioButton(radio);
            return true;
        }
    }
    
    console.log('No matching radio button found for:', value);
    console.log('Available options:');
    radioButtons.forEach((radio, index) => {
        console.log(`  ${index}: "${getRadioLabel(radio)}"`);
    });
    
    return false;
}

function selectRadioButton(radio) {
    // Focus the radio button first
    radio.focus();
    
    // Click the radio button
    radio.click();
    
    // Ensure it's checked
    radio.checked = true;
    
    // Dispatch multiple events to ensure Google Forms recognizes the selection
    const events = ['click', 'change', 'input'];
    events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true, cancelable: true });
        radio.dispatchEvent(event);
    });
    
    // Also try dispatching a mouse event
    const mouseEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    radio.dispatchEvent(mouseEvent);
    
    // Blur after a short delay
    setTimeout(() => {
        radio.blur();
    }, 100);
}

function getRadioLabel(radio) {
    // Get the label for a radio button
    let label = '';
    
    // Method 1: Look for aria-label or aria-labelledby
    if (radio.getAttribute('aria-label')) {
        label = radio.getAttribute('aria-label');
    } else if (radio.getAttribute('aria-labelledby')) {
        const labelId = radio.getAttribute('aria-labelledby');
        const labelElement = document.getElementById(labelId);
        if (labelElement) {
            label = labelElement.textContent.trim();
        }
    }
    
    // Method 2: Look for associated label element
    if (!label && radio.id) {
        const labelElement = document.querySelector(`label[for="${radio.id}"]`);
        if (labelElement) {
            label = labelElement.textContent.trim();
        }
    }
    
    // Method 3: Look for nearby span or div with text (Google Forms specific)
    if (!label) {
        // Check parent container for text content
        let parent = radio.parentElement;
        let attempts = 0;
        while (parent && attempts < 5) {
            const spans = parent.querySelectorAll('span:not(:empty), div:not(:empty)');
            for (let span of spans) {
                const text = span.textContent.trim();
                // Filter out empty spans and very long text
                if (text && text.length > 1 && text.length < 100 && 
                    !text.includes('*') && !text.includes('Required') && 
                    span !== radio && !span.contains(radio)) {
                    label = text;
                    break;
                }
            }
            if (label) break;
            parent = parent.parentElement;
            attempts++;
        }
    }
    
    // Method 4: Look for text content in closest clickable element
    if (!label) {
        const clickableParent = radio.closest('[role="radio"], [role="option"], label, .freebirdFormviewerViewItemsRadioChoice');
        if (clickableParent) {
            // Get all text nodes, excluding the radio button itself
            const walker = document.createTreeWalker(
                clickableParent,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        // Only accept text nodes that aren't in the radio input itself
                        if (node.parentElement && 
                            node.parentElement !== radio && 
                            !node.parentElement.contains(radio) &&
                            node.textContent.trim().length > 0) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                        return NodeFilter.FILTER_REJECT;
                    }
                }
            );
            
            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                textNodes.push(node.textContent.trim());
            }
            
            if (textNodes.length > 0) {
                label = textNodes.join(' ').trim();
            }
        }
    }
    
    // Method 5: Look for next sibling text
    if (!label) {
        let nextSibling = radio.nextElementSibling;
        while (nextSibling) {
            const text = nextSibling.textContent.trim();
            if (text && text.length > 1 && text.length < 50) {
                label = text;
                break;
            }
            nextSibling = nextSibling.nextElementSibling;
        }
    }
    
    // Method 6: Look for previous sibling text
    if (!label) {
        let prevSibling = radio.previousElementSibling;
        while (prevSibling) {
            const text = prevSibling.textContent.trim();
            if (text && text.length > 1 && text.length < 50) {
                label = text;
                break;
            }
            prevSibling = prevSibling.previousElementSibling;
        }
    }
    
    return label.trim();
}

function fillInput(input, value) {
    if (input && value) {
        console.log('Filling input with value:', value);
        
        // Focus on the input first
        input.focus();
        
        // Clear existing value
        input.value = '';
        
        // Set new value
        input.value = value;
        
        // Trigger multiple events to ensure Google Forms recognizes the change
        const events = ['input', 'change', 'blur', 'keyup', 'keydown'];
        events.forEach(eventType => {
            const event = new Event(eventType, { bubbles: true });
            input.dispatchEvent(event);
        });
        
        // Also trigger a synthetic keyboard event
        const keyboardEvent = new KeyboardEvent('keyup', {
            bubbles: true,
            cancelable: true,
            key: 'Enter',
            keyCode: 13
        });
        input.dispatchEvent(keyboardEvent);
        
        // Final focus and blur
        input.focus();
        setTimeout(() => {
            input.blur();
        }, 100);
    }
}

function handleTimeField(item, timeValue) {
    console.log('Handling time field with value:', timeValue);
    
    // Parse the time string (format: "HH:MM AM/PM")
    const match = timeValue.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) {
        console.error('Invalid time format:', timeValue);
        return;
    }
    
    const hour = match[1];
    const minute = match[2];
    const ampm = match[3].toUpperCase();
    
    console.log(`Parsed time: hour=${hour}, minute=${minute}, ampm=${ampm}`);
    
    // Find all input elements in this item
    const inputs = item.querySelectorAll('input');
    let hourInput = null;
    let minuteInput = null;
    let ampmInput = null;
    
    // Check for multiple input fields (Google Forms style)
    if (inputs.length > 1) {
        // Try to identify hour and minute fields
        inputs.forEach((input, index) => {
            const placeholder = input.placeholder || '';
            const ariaLabel = input.getAttribute('aria-label') || '';
            const combinedText = (placeholder + ' ' + ariaLabel).toLowerCase();
            
            // Check if this is an hour input
            if (!hourInput && (combinedText.includes('hour') || index === 0)) {
                hourInput = input;
            }
            // Check if this is a minute input
            else if (!minuteInput && (combinedText.includes('minute') || index === 1)) {
                minuteInput = input;
            }
        });
        
        // Find the AM/PM dropdown
        const select = item.querySelector('select');
        if (select) {
            ampmInput = select;
        }
        
        // Fill the inputs if found
        if (hourInput) {
            console.log('Filling hour input with:', hour);
            fillInput(hourInput, hour);
        }
        
        if (minuteInput) {
            console.log('Filling minute input with:', minute);
            fillInput(minuteInput, minute);
        }
        
        if (ampmInput) {
            console.log('Filling AM/PM input with:', ampm);
            // For dropdown, set the value and trigger change event
            ampmInput.value = ampm;
            ampmInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    } else {
        // Single time input field
        const timeInput = item.querySelector('input[type="time"]');
        const textInput = item.querySelector('input[type="text"]');
        
        if (timeInput) {
            console.log('Filling single time input');
            fillInput(timeInput, timeValue);
        } else if (textInput) {
            console.log('Filling single text input for time');
            fillInput(textInput, timeValue);
        }
    }
}

function findAndHandleTimeFields(data) {
    console.log('Looking for time fields by sections');
    
    // Find all potential time field containers
    const formSections = document.querySelectorAll('[role="listitem"], .freebirdFormviewerViewItemsItemItem, .freebirdFormviewerViewItemsTimeTimeContainer');
    
    formSections.forEach((section, index) => {
        // Look for headings or labels in this section
        const headings = section.querySelectorAll('[role="heading"], .freebirdFormviewerViewItemsItemItemTitle');
        
        // Check if any heading contains "time in" or "time out"
        let isTimeIn = false;
        let isTimeOut = false;
        
        for (let heading of headings) {
            const text = heading.textContent.toLowerCase();
            if (text.includes('time') && text.includes('in')) {
                isTimeIn = true;
                break;
            } else if (text.includes('time') && text.includes('out')) {
                isTimeOut = true;
                break;
            }
        }
        
        // If no heading was found, check section text content
        if (!isTimeIn && !isTimeOut) {
            const sectionText = section.textContent.toLowerCase();
            if (sectionText.includes('time') && sectionText.includes('in')) {
                isTimeIn = true;
            } else if (sectionText.includes('time') && sectionText.includes('out')) {
                isTimeOut = true;
            }
        }
        
        // Handle time section if found
        if (isTimeIn) {
            console.log(`Found Time In section at index ${index}`);
            handleTimeField(section, data.timeIn);
        } else if (isTimeOut) {
            console.log(`Found Time Out section at index ${index}`);
            handleTimeField(section, data.timeOut);
        }
    });
}

function fillByInputs(data) {
    console.log('Trying fallback method to fill inputs');
    
    // Find time fields as a group and handle them
    findAndHandleTimeFields(data);
    
    // Get all inputs on the page
    const allInputs = document.querySelectorAll('input, textarea');
    
    allInputs.forEach((input, index) => {
        const type = input.type;
        const ariaLabel = input.getAttribute('aria-label') || '';
        const placeholder = input.placeholder || '';
        const name = input.name || '';
        
        console.log(`Input ${index}: type=${type}, aria-label="${ariaLabel}", placeholder="${placeholder}", name="${name}"`);
        
        const combinedText = (ariaLabel + ' ' + placeholder + ' ' + name).toLowerCase();
        
        // Try to match based on all available text
        if (type === 'text' || type === 'email' || input.tagName === 'TEXTAREA') {
            if (combinedText.includes('name') && !combinedText.includes('project') && !combinedText.includes('course')) {
                fillInput(input, data.name);
            } else if (combinedText.includes('email')) {
                fillInput(input, data.email);
            } else if (combinedText.includes('sr') && combinedText.includes('code')) {
                fillInput(input, data.srCode);
            } else if (combinedText.includes('course')) {
                fillInput(input, data.course);
            } else if (combinedText.includes('accomplishment') || combinedText.includes('report')) {
                fillInput(input, data.accomplishment);
            }
        } else if (type === 'date' && combinedText.includes('date')) {
            fillInput(input, data.date);
        }
    });
}