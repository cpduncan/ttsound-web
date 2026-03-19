import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

<section id="center">

    <div class="flex-container">

      <div class="flex-item">Control Panel
        <button>New Node</button>
        <button>New Scene</button>
        <button>Save Scene</button>
        <button>Load Scene</button>
      </div>

      <div class="flex-item">Scene View
      </div>

      <div class="flex-item">Context Panel
      </div>

    </div>

</section>

`
