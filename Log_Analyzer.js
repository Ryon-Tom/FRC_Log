  spread_sheet = SpreadsheetApp.getActiveSpreadsheet();
  data_sheet = spread_sheet.getSheetByName("AnalysisOfInformation");
  last_row = data_sheet.getLastRow();
  range = data_sheet.getRange("a2:d" + last_row);
  loop_count = last_row - 1;
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Robotics Tools")
  .addItem("generateSummaries", "main")
  .addToUi(); 
}
function main() {
  prompts = generatePrompts();
  generateAnswers(prompts);
}
function generateAnswers(prompts) {
  for (i = 0; i < loop_count; i++) {
    answer = callResponsesAPI(prompts[i]);
    target_cell = data_sheet.getRange("E" + (i + 2));
    target_cell.setValue(answer);
  } 
}



function generatePrompts(row, column) { 
  values = range.getValues();

  Logger.log(values[0][1]);
  Logger.log(loop_count);
  queries = [];

  for (i = 0; i < loop_count; i++) {
    name = values[i][0];
    focuses = values[i][1];
    description = values[i][2];
    date = values[i][3];
    prompt = `Please write short 3 sentence description of what ${name} did on ${date}. Ensure that your answer does not assume anything. The description of his work: ${description}. The focuses of his work as identified by him were: ${focuses}. Write it such that it would fit into the context of a notebook that documented work on an FRC robotics team 10256. Make sure it sounds cohesive and you dont have to mention the team name or anything unless necessary. In the beginning of each start with something like On (Date), (First Name) worked on ... - ONLY RESPOND WITH SENTENCES`;
    queries.push(prompt);
  };

  return queries;
}

function callResponsesAPI(prompt) {
  const apiKey = "ADD_YOURS_HERE"
  const url = "https://api.openai.com/v1/responses";
  const payload = { model: "gpt-4.1-mini", input: prompt, max_output_tokens: 200 };
  const options = {
    method: "post",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  const resp = UrlFetchApp.fetch(url, options);
  const code = resp.getResponseCode();
  const json = JSON.parse(resp.getContentText());

  if (code >= 300) throw new Error(json.error?.message || `HTTP ${code}: ` + resp.getContentText());
  // Robust extraction across variants
  return json.output_text
      || json.output?.[0]?.content?.[0]?.text
      || json.choices?.[0]?.message?.content
      || "No text found.";
}


