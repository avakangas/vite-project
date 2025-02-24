*** Settings ***
Library    Browser
Resource   Keywords3.robot

*** Variables ***
${WEB_FORM_URL}    http://localhost:5173/src/pages/authtest.html

*** Test Cases ***
Test Web Form Elements
    New Browser    chromium    headless=False
    New Page       ${WEB_FORM_URL}
    
    # Verify page title
    Get Title    ==    Web form
    
    # Fill text input
    Type Text    [name="my-text"]    Testikäyttäjä    delay=0.1s
    
    # Select from a dropdown
    Select Options By    css=select[name="my-select"]    value    2
    
    # Select from a datalist dropdown
    Fill Text    css=input[name="my-datalist"]    San Francisco
    
    # Upload a file (korjattu avainsana)
    Set File Input    css=input[name="my-file"]    ${CURDIR}/testfile.txt
    
    # Click checkboxes
    Check Checkbox    css=input[name="my-check"]
    
    # Select a radio button
    Check Checkbox    css=input[name="my-radio"]
    
    # Submit the form
    Click    css=button
    
    # Verify successful submission
    Wait For Elements State    css=#message    visible
    Get Text    id=message    ==    Received!
    
    Close Browser
