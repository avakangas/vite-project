*** Settings ***
Library     Browser      auto_closing_level=SUITE
Library     CryptoLibrary     variable_decryption=True

*** Variables ***
${Username}    crypt:hiougbHKJNLIhugyvFTPgukjbni98YVHBOKPJILHKyghjbkGUHJ90876UFGHBIOJHujhnlihUH8Uuhk
${Password}    crypt:wbehlj039847rytguveifbjkewk0+u293pqilpoiepjihoqUIKJNoihuIOHULiohukjIJOHLKJojioh

*** Test Cases ***
Test Web Form
    [Documentation]    Testaa kirjautumislomake salatuilla tunnuksilla
    New Browser         chromium    headless=No
    New Page            http://localhost:5173/src/pages/authtest.html
    Set Viewport Size   1280    800
    Get Title           ==    Diary App

    Type Text           [id="username"]        ${Username}    delay=0.1 s
    Type Secret         [id="password"]        ${Password}    delay=0.1 s
    Click               xpath=//button[text()='Log In']

    Wait For Elements State    css=[data-testid="dashboard"]    visible    timeout=5s
    Run Keyword And Continue On Failure    Take Screenshot    login_check.png

    Sleep    2s
