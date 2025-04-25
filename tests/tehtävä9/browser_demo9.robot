*** Settings ***
Library    RequestsLibrary

*** Variables ***
${BASE_URL}    http://localhost:5000/api

*** Test Cases ***

Test Get All Diary Entries
    Create Session    healthapi    ${BASE_URL}
    ${response}=    GET    healthapi    /entries
    Should Be Equal As Strings    ${response.status_code}    200
    Log    ${response.json()}    console=True

Test Create New Diary Entry
    Create Session    healthapi    ${BASE_URL}
    ${data}=    Create Dictionary    title=Uni    mood=Hyvä    notes=Heräsin virkeänä
    ${response}=    POST    healthapi    /entries    json=${data}
    Should Be Equal As Strings    ${response.status_code}    201
    Log    ${response.json()}    console=True

Test Unauthorized Access
    Create Session    healthapi    ${BASE_URL}
    ${response}=    GET    healthapi    /protected
    Should Be Equal As Strings    ${response.status_code}    401
