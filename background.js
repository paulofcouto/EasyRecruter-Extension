chrome.runtime.onStartup.addListener(() => {
  console.log('Chrome iniciado - limpando token de autenticação.');
  chrome.storage.local.remove('authToken', () => {
    if (chrome.runtime.lastError) {
      console.error('Erro ao remover o token:', chrome.runtime.lastError.message);
    } else {
      console.log('Token removido com sucesso.');
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'sendToAPI') {

        chrome.storage.local.get(['authToken'], (result) => {
            const token = result.authToken;
            if (!token) {
                console.error('Token não encontrado.');
                sendResponse({
                    status: 'erro',
                    mensagem: 'Autenticação necessária'
                });
                return;
            }

            chrome.tabs.query({
                active: true,
                lastFocusedWindow: true
            }, (tabs) => {
                const currentTab = tabs[0];
                if (currentTab) {
                    chrome.scripting.executeScript({
                        target: {tabId: currentTab.id},
                        files: ["scripts/contentScript.js"]
                    }, () => {

                        chrome.tabs.sendMessage(currentTab.id, {
                            action: 'captureData'
                        }, (response) => {
                            // Verifica se os dados foram recebidos corretamente
                            if (!response || !response.dadosCapturados) {
                                console.error('Nenhum dado capturado. Verifique o script de conteúdo.');
                                sendResponse({
                                    status: 'erro',
                                    mensagem: 'Nenhum dado capturado.'
                                });
                                return;
                            }

                            const urlData = {
                                urlPublica: currentTab.url,
                                nome: response.dadosCapturados.nome,
                                descricaoProfissional: response.dadosCapturados.descricaoProfissional,
                                sobre: response.dadosCapturados.sobre,
								foto: response.dadosCapturados.foto,
                                experiencias: response.dadosCapturados.experiencias.map(exp => ({
                                    empresa: exp.empresa,
                                    local: exp.local,
                                    cargos: exp.cargos.map(cargo => ({
                                        titulo: cargo.titulo,
                                        periodo: cargo.periodo,
                                        descricao: cargo.descricao
                                    }))
                                })),
                                formacoes: response.dadosCapturados.formacaoAcademica.map(form => ({
                                    instituicao: form.instituicao,
                                    curso: form.curso,
                                    periodo: form.periodo
                                }))
                            };
							
					
                            fetch('https://easyrecruter.com.br/v1/CandidatoExterno/SalvarDados', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify(urlData)
                                })
								.then(res => {
									const contentType = res.headers.get('content-type');
									
									if (contentType && contentType.includes('application/json')) {
										return res.json().then(data => {
											if (!res.ok) {
												if (data.errors) {
													const errorMessages = Object.entries(data.errors)
														.map(([key, value]) => `${key}: ${value.join(', ')}`)
														.join('\n- ');
													throw new Error(errorMessages);
												}
												throw new Error('Erro desconhecido.');
											}
											return data;
										});
									} else {
										return res.text().then(text => {
											if (!res.ok) {
												throw new Error(text || 'Erro desconhecido');
											}
											return text;
										});
									}
								})
								.then(data => {
									sendResponse({
										status: 'sucesso',
										dados: data
									});
								})
								.catch(err => {
									try {
										const parsedError = JSON.parse(err.message);
										if (parsedError.errors) {
											const errorMessages = Object.entries(parsedError.errors)
												.map(([key, value]) => `${key}: ${value.join(', ')}`)
												.join('\n- ');
											sendResponse({
												status: 'erro',
												mensagem: `Erro ao enviar para a API:\n- ${errorMessages}`
											});
										}
										else {
											sendResponse({
												status: 'erro',
												mensagem: `Erro ao enviar para a API:\n- ${err.message}`
											});
										}
									} 
									catch (parseError) {
										sendResponse({
											status: 'erro',
											mensagem: `Erro ao enviar para a API:\n- ${err.message}`
										});
									}
								});
                        });
                    });
                }
            });
        });

        return true;
    }
});