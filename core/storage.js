const PROJECT_KEY = "paramio_project_v218";

function saveProject(project){
  localStorage.setItem(PROJECT_KEY, JSON.stringify(project));
}

function loadProject(){
  const raw = localStorage.getItem(PROJECT_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearProject(){
  localStorage.removeItem(PROJECT_KEY);
}