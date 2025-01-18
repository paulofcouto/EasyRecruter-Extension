async function capturarPerfilCompleto() {
  const perfil = {};

  perfil.URL = window.location.href;

  const nomeElement = document.querySelector('.v-align-middle.break-words');
  perfil.nome = nomeElement ? nomeElement.innerText.trim() : '';//'Nome não encontrado';

  const cargoElemento = document.querySelector('.text-body-medium.break-words');
  perfil.descricaoProfissional = cargoElemento ? cargoElemento.innerText.trim() : '';//'Descrição profissional não encontrado';

  perfil.sobre = capturarTextoSobre();

  perfil.experiencias = capturarExperiencias();

  perfil.formacaoAcademica = capturarFormacaoAcademica();
  
  perfil.foto = await capturarFoto();

  return perfil;
}

function capturarTextoSobre() {
  const section = Array.from(document.querySelectorAll('section.artdeco-card.pv-profile-card.break-words.mt2'))
    .find(sec => sec.querySelector('div#about.pv-profile-card__anchor'));

  if (section) {
    const divPrincipal = section.querySelector('div.display-flex.ph5.pv3');
    if (divPrincipal) {
      const divSecundaria = divPrincipal.querySelector('div.display-flex.full-width');
      if (divSecundaria) {
        const spanVisuallyHidden = divSecundaria.querySelector('span.visually-hidden');
        if (spanVisuallyHidden) {
          const texto = spanVisuallyHidden.innerHTML.replace(/<br\s*[\/]?>/gi, '\n');
          return texto.trim();
        }
      }
    }
  }
  return 'Sobre não encontrado';
}

function capturarExperiencias() {
  const experiencias = [];
  const sectionExperiencias = Array.from(document.querySelectorAll('section.artdeco-card.pv-profile-card.break-words.mt2'))
    .find(sec => sec.querySelector('div#experience.pv-profile-card__anchor'));

  if (sectionExperiencias) {
    const divsDentroDaSection = sectionExperiencias.children;
    if (divsDentroDaSection.length >= 3) {
      const terceiraDiv = divsDentroDaSection[2];
      const ulExperiencias = terceiraDiv.querySelector('ul');

      if (ulExperiencias) {
        const listaLi = Array.from(ulExperiencias.children).filter(li => li.tagName.toLowerCase() === 'li');
        listaLi.forEach((li) => {
          const experiencia = {};

          const hasMultipleCargos = li.querySelector('.display-flex.align-items-center.mr1.hoverable-link-text.t-bold') !== null;

          if (hasMultipleCargos) {
            const empresaElement = li.querySelector('.display-flex.align-items-center.mr1.hoverable-link-text.t-bold span.visually-hidden');
			experiencia.empresa = empresaElement ? empresaElement.innerText.trim() : '';//'Empresa não encontrada';

			const localElement = Array.from(li.querySelectorAll('.t-14.t-normal.t-black--light'))
			  .map(span => {
				const visuallyHidden = span.querySelector('span.visually-hidden');
				const ariaHidden = span.querySelector('span[aria-hidden="true"]');

				if (visuallyHidden && ariaHidden && visuallyHidden.innerText.trim() === ariaHidden.innerText.trim()) {
				  return visuallyHidden;
				}
				return null;
			  })
			  .filter(span => span !== null)
			  .pop();
			experiencia.local = localElement ? localElement.innerText.trim() : '';//'Local não encontrado';

			experiencia.cargos = [];

			const cargosList = Array.from(li.querySelectorAll('ul > li')).filter(subLi => {
			  return subLi.querySelector('div[data-view-name="profile-component-entity"]') !== null;
			});

			cargosList.forEach(subLi => {
			  const cargo = {};

			  const tituloElement = subLi.querySelector('.display-flex.align-items-center.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]');
			  cargo.titulo = tituloElement ? tituloElement.innerText.trim() : '';//'Cargo não encontrado';

			  const periodoElement = subLi.querySelector('.t-14.t-normal.t-black--light span.visually-hidden');
			  cargo.periodo = periodoElement ? periodoElement.innerText.trim() : '';//'Período não encontrado';

			  const descricaoElement = subLi.querySelector('.full-width.t-14.t-normal.t-black.display-flex.align-items-center span.visually-hidden');
			  cargo.descricao = descricaoElement ? descricaoElement.innerText.trim() : '';//'Descrição não encontrada';

			  if (cargo.titulo && cargo.periodo && cargo.descricao) {
			    experiencia.cargos.push(cargo);
			  }
			});
          } 
		  else {
			experiencia.empresa = li.querySelector('.display-flex.flex-column.full-width .t-14.t-normal span.visually-hidden')?.innerText.trim() || '';//'Empresa não encontrada';
            
			experiencia.local = li.querySelectorAll('.display-flex.flex-column.full-width .t-14.t-normal.t-black--light span.visually-hidden')[1]?.innerText.trim() || '';//'Local não encontrado';
			
			experiencia.cargos = [{
              titulo: li.querySelector('.display-flex.align-items-center.mr1.t-bold span.visually-hidden')?.innerText.trim() || '',//'Cargo não encontrado',
              periodo: li.querySelector('.display-flex.flex-column.full-width .t-14.t-normal.t-black--light span.visually-hidden')?.innerText.trim() || '',//'Período não encontrado',
              descricao: li.querySelector('.pvs-entity__sub-components span.visually-hidden')?.innerText.trim() || ''//'Descrição não encontrada'
            }];
          }
		  
		  experiencias.push(experiencia);
        });
      }
    }
  }
  
  return experiencias;
}

function capturarFormacaoAcademica() {
  const formacaoAcademica = [];
  const sectionFormacao = Array.from(document.querySelectorAll('section.artdeco-card.pv-profile-card.break-words.mt2'))
    .find(sec => sec.querySelector('div#education.pv-profile-card__anchor'));

  if (sectionFormacao) {
    const divsDentroDaSection = sectionFormacao.children;
    if (divsDentroDaSection.length >= 3) {
      const terceiraDiv = divsDentroDaSection[2];
      const ulFormacao = terceiraDiv.querySelector('ul');

      if (ulFormacao) {
        const listaLi = Array.from(ulFormacao.children).filter(li => li.tagName.toLowerCase() === 'li');
        listaLi.forEach((li) => {
          const formacao = {};

          // Captura a Instituição
          const instituicaoElement = li.querySelector('.display-flex.align-items-center.mr1.t-bold span.visually-hidden');
          formacao.instituicao = instituicaoElement ? instituicaoElement.innerText.trim() : '';//'Instituição não encontrada';

          // Captura o Curso
          const cursoElement = li.querySelector('.display-flex.flex-column.full-width .t-14.t-normal span.visually-hidden');
          formacao.curso = cursoElement ? cursoElement.innerText.trim() : '';//'Curso não encontrado';

          // Captura o Período
          const periodoElement = li.querySelector('.display-flex.flex-column.full-width .t-14.t-normal.t-black--light span.visually-hidden');
          formacao.periodo = periodoElement ? periodoElement.innerText.trim() : '';//'Período não encontrado';

          formacaoAcademica.push(formacao);
        });
      }
    }
  }
  return formacaoAcademica;
}

async function capturarFoto() {
	const primarySelector = 'button.pv-top-card-profile-picture__container';
    const fallbackSelector = 'button.profile-photo-edit__edit-btn';

    let buttonElement = document.querySelector(primarySelector);

    if (!buttonElement) {
        buttonElement = document.querySelector(fallbackSelector);
    }

    if (!buttonElement) return '';

    const imgElement = buttonElement.querySelector('img');

    if (!imgElement || !imgElement.src) return '';

    const response = await fetch(imgElement.src);
    if (!response.ok) return '';

    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result || '');
        reader.readAsDataURL(blob); // Converte para Base64
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (document.readyState != 'complete') {
        sendResponse({ status: 'aguarde' });
        return true;
    }
    else if (message.action === 'captureData') {
        capturarPerfilCompleto().then((perfil) => {
            sendResponse({ dadosCapturados: perfil });
        }).catch((err) => {
            console.error('Erro ao capturar perfil:', err);
            sendResponse({ dadosCapturados: null });
        });
        return true;
    }
});