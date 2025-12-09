// 删除用户相关函数
function deleteUser(userId) {
    document.getElementById('delete-modal').dataset.userId = userId;
    document.getElementById('delete-modal').classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.add('hidden');
}

function confirmDelete() {
    const userId = document.getElementById('delete-modal').dataset.userId;
    
    fetch(`/admin/users/${userId}/delete`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('服务器响应错误：' + response.status);
        }
        return response.json();
    }).then(data => {
        if (data.success) {
            const row = document.querySelector(`tr[data-id="${userId}"]`);
            if (row) {
                row.classList.add('fade-out');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
            showToast('用户已删除！');
        } else {
            showToast(data.message || '删除失败！', true);
        }
    }).catch(error => {
        console.error('删除用户出错:', error);
        showToast('提交请求时出错: ' + error.message, true);
    });
    
    closeDeleteModal();
}

// 通用提示框
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.style.backgroundColor = isError ? '#e53935' : '#1976d2';
    toast.classList.remove('hidden');
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 500);
    }, 3000);
} 