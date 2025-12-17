import {
    messages,
    currentUser,
    selectedFile,
    setMessages
} from './state.js';
import {
    messageTypeModal,
    messageList,
    messageInput,
    typeSelection,
    privateKeyEntry,
    modalPrivateKey
} from './ui-elements.js';
import {
    renderMessage
} from './main-rendering-function.js';
import {
    clearSelectedFile
} from './utils.js';
import {
    loadCommentsForMessage
} from './comment-loader.js';
import {
    uploadFile
} from './file-upload.js';


export const postMessageToAPI = async (content, isPrivate, privateKey) => {
    try {
        // 获取文件数据
        let fileData = null;
        if (messageTypeModal.dataset.fileData) {
            try {
                fileData = JSON.parse(messageTypeModal.dataset.fileData);
            } catch (e) {
                console.error('Failed to parse file data:', e);
            }
        }

        // 构建请求体
        const requestBody = {
            content,
            isPrivate,
            privateKey
        };

        // 添加文件信息
        if (fileData) {
            requestBody.hasImage = true; // 保持现有字段名以向后兼容
            requestBody.imageFilename = fileData.filename;
            requestBody.imageMimeType = fileData.mimeType;
            requestBody.imageSize = fileData.size;
        }

        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const newMessage = await response.json();

            // 如果是 public 消息或用户已登录，则立即在 UI 中显示新消息
            if (!isPrivate || currentUser) {
                // 更新 state
                setMessages([newMessage, ...messages]);

                // 创建新消息的 DOM 元素
                const renderedMessage = renderMessage(newMessage);

                // 将新消息添加到列表顶部
                if (renderedMessage) {
                    messageList.prepend(renderedMessage);
                }
                
                // 为新消息加载评论以显示正确的 Reply 按钮状态
                loadCommentsForMessage(newMessage.id);
            }

            // 清理输入框和文件选择
            messageInput.value = '';
            clearSelectedFile();

        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error || 'Something went wrong'}`);
        }
    } catch (error) {
        console.error('Error submitting message:', error);
        alert('Failed to post message.');
    }
};

export const handlePostSubmit = async (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();

    if (!content && !selectedFile) {
        alert("Message content can't be empty unless you're uploading a file.");
        return;
    }

    try {
        let uploadedFileData = null;
        if (selectedFile) {
            // 如果有文件，先上传文件
            uploadedFileData = await uploadFile(selectedFile.file);
            messageTypeModal.dataset.fileData = JSON.stringify(uploadedFileData);
        } else {
            messageTypeModal.dataset.fileData = '';
        }

        // 弹出消息类型选择模态框
        messageTypeModal.dataset.pendingContent = content;
        // 重置模态框视图
        typeSelection.classList.remove('hidden');
        privateKeyEntry.classList.add('hidden');
        modalPrivateKey.value = '';
        messageTypeModal.showModal();
    } catch (uploadError) {
        console.error('File upload failed:', uploadError);
        alert(uploadError.message || 'File upload failed. Please try again.');
    }
};