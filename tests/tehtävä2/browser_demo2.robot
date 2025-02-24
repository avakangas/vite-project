*** Settings ***
Library     Browser    auto_closing_level=KEEP
Resource    Keywords3.robot  

*** Test Cases ***
Test Web Form
    New Browser    chromium    headless=No  
    New Page       http://localhost:5174/src/pages/authtest.html

    ${actual_title}    Get Title
    Log    ${actual_title}
    Should Be Equal    ${actual_title}    Authentication System

    Type Text      [name="my-text"]        ${Username}    delay=0.1 s 
    Type Secret    [name="my-password"]    ${Password}    delay=0.1 s
    Type Text      [name="my-textarea"]    ${Message}     delay=0.1 s
    Click With Options    button    delay=2 s
    Get Text       id=message    ==    Received!
