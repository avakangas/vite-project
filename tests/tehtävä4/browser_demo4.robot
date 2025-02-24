*** Settings ***
Library    Browser
Resource   Keywords4.robot

*** Variables ***
${URL}             http://localhost:5173/src/pages/authtest.html
${BROWSER}         Chrome
${ENTRY_TEXT}      "Tänään voin hyvin ja söin terveellisesti."

*** Test Cases ***
Lisää uusi päiväkirjamerkintä
    Open Browser  ${URL}  ${BROWSER}
    Wait Until Element Is Visible  id=new-entry  timeout=5s
    Input Text  id=entry-text  ${ENTRY_TEXT}
    Click Button  id=save-entry
    Wait Until Element Contains  id=entries-list  ${ENTRY_TEXT}  timeout=5s
    Close Browser
