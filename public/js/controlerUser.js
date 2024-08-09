document.addEventListener('DOMContentLoaded', () => {
    // Eliminar el usuario
    const deleteUserBtn = document.querySelectorAll('#deleteUser');

    deleteUserBtn.forEach(button => {
        button.addEventListener('click', async () => {
            const userId = button.getAttribute('data-id');

            try {
                const response = await fetch(`/api/sessions/controlerUser/${userId}`, { method: 'DELETE' });

                if (response.ok) {
                    alert('Usuario eliminado correctamente!');
                    location.reload();
                } else {
                    throw new Error('No se pudo eliminar el usuario de manera correcta');
                }
            } catch (error) {
                console.error('Error al intentar eliminar los usuarios de la base de datos', error);
                alert('Error al intentar eliminar el usuario de la base de datos');
            }
        });
    });

    // Manejar la modificación de roles
    const changeRoleBtn = document.querySelectorAll('#changeRole');

    changeRoleBtn.forEach(button => {
        button.addEventListener('click', async () => {
            const userId = button.getAttribute('data-id');
            const newRole = button.previousElementSibling.value;

            if (!newRole) {
                alert("No se ingresó un rol correcto!");
                return;
            }

            try {
                const response = await fetch(`/api/sessions/controlerUser/${userId}/role`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ role: newRole })
                });

                if (response.ok) {
                    alert('Rol de usuario modificado exitosamente');
                    location.reload();
                } else {
                    throw new Error('No se pudo modificar el rol del usuario');
                }
            } catch (error) {
                console.error('Error al intentar modificar el rol del usuario', error);
                alert('Error al intentar modificar el rol del usuario');
            }
        });
    });
});
