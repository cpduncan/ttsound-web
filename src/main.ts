import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

<section id="center">

    <div class="flex-container">

      <div class="flex-item" id="left-panel">Control Panel

        <button id="newNodeButton">New Node</button>

        <button id="newSceneButton">New Scene</button>

        <button id="saveSceneButton">Save Scene</button>

        <button id="loadSceneButton">Load Scene</button>

      </div>


      <div class="flex-item" id="center-panel">Scene View

        <div id="scene"></div>

      </div>


      <div class="flex-item" id="right-panel">Context Panel



      </div>

    </div>

</section>

`

// Ensure DOM is loaded before attaching events
document.addEventListener("DOMContentLoaded", () => {

const leftPanel = document.getElementById("left-panel");

leftPanel?.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;

  if (target.tagName !== "BUTTON") return; // ignore non-buttons

  switch (target.id) {
    case "newNodeButton":
      console.log("Create Node");
      break;

    case "newSceneButton":
      console.log("Create Scene");
      break;

    case "saveSceneButton":
      console.log("Save Scene");
      break;

    case "loadSceneButton":
      console.log("Load Scene");
      break;
  }
});
});