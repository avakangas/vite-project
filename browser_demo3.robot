*** Settings ***
Library     Browser    auto_closing_level=KEEP
Resource    Keywords.robot  

*** Settings ***
Documentation     ympäristömuuttujia
Library           Collections
Variables         load_env.py

*** Test Cases ***
Example Test Case
    [Documentation]    testi
    Log    API Key: ${API_KEY}
    Log    Base URL: ${BASE_URL}
