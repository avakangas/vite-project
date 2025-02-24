*** Settings ***
Library     Browser    auto_closing_level=KEEP
Variables   pythonkirjasto.py

*** Test Cases ***
Kirjautumistesti
    New Browser  headless=false
    New Page     http://localhost:5173/src/pages/authtest.html
    Type Text      [id="username"]        ${Username}    delay=0.1 s 
    Type Secret    [id="password"]    $Password      delay=0.1 s
    Click        id=login-button
    Wait For Elements State  id=logout-button  visible  5s
    Close Browser
