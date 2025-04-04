// google-auth.js
export function initializeGoogleAuth(handleAuthSuccess) {
    window.onload = function () {
        fetch('/config')
            .then(response => response.json())
            .then(config => {
                google.accounts.id.initialize({
                    client_id: config.clientId,
                    callback: handleCredentialResponse,
                });

                google.accounts.id.renderButton(
                    document.getElementById('googleSignIn'),
                    {
                        theme: 'filled_blue',
                        size: 'large',
                        text: 'long',
                        type: 'standard'
                    }
                );
            })
            .catch(error => {
                console.error('Error fetching client_id:', error);
            });
    };

    function handleCredentialResponse(response) {
        fetch('https://localhost:8080/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(response)
        })
            .then(response => {
                if (response.status === 201) {
                    return response.json();
                } else {
                    throw new Error('Request failed. Returned status of ' + response.status + ' ' + response.statusText);
                }
            })
            .then(data => {
                let sessionToken = data.sessionToken;
                localStorage.setItem('sessionToken', sessionToken);
                Vue.sessionToken = sessionToken;
                console.log('Session Token: ' + sessionToken);

                // Call the success handler
                if (handleAuthSuccess) {
                    handleAuthSuccess();
                } else {
                    window.location.href = "/todos.html";
                }
            })
            .catch(error => {
                console.log('Error:', error);
            });
    }
}

export function setupGuestSession() {
    document.getElementById('guestLink')?.addEventListener('click', async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/guest-init', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = '/todos.html';
            } else {
                console.error('Guest init failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}