let group;
// socket connection
let socket = io('/user-namespace', {
    auth: {
        token: sender// right now I haven't implemented JWT so I simply pass user email as token 
    }
});

// < --------------------------------------------------- Start group chat script ------------------------------------------------ >

$(document).ready(function () {
    // load chat of particular user
    $('.group_list').click(function () {
        group = $(this).attr('data-id');
        $('.group-start-head').hide();
        $('.group-chat-section').show();
        socket.emit('loadOldGroupChat', {
            sender,
            group,
        });
    });

    // remove action bar
    $(document).on('click', '.fa-close', function () {
        $('#actionBar').remove();
    });


    // delete user chat
    $(document).on('click', '.fa-trash-group', function () {
        let chatId = $(this).attr('data-id');
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                let chat = {
                    sender,
                    group,
                    id: chatId
                };
                socket.emit('deleteGroupChat', chat);
            }
        });
    });

    // edit user chat
    $(document).on('click', '.fa-edit', function () {
        let chatId = $(this).attr('data-id');
        let chatMessage = $(this).attr('data-message');
        $('#group_chat_id').val(chatId);
        $('#group_message').val(chatMessage);
    });

    // copy user chat
    $(document).on('click', '.fa-copy', function () {
        const $temp = $("<input>");
        $("body").append($temp);
        $temp.val($(this).attr('data-message')).select();
        document.execCommand("copy");
        $temp.remove();
    });

    let mousedown, mouseup;
    // show action bar for sender chat
    $(document).on('mousedown', '.sender-chat', function () {
        mousedown = (new Date()).getTime();
    });
    $(document).on('mouseup', '.sender-chat', function () {
        mouseup = (new Date()).getTime();
        if ((mouseup - mousedown) / 1000 > 2) {
            if ($('#actionBar')) {
                $('#actionBar').remove();
            }
            $('#group-chat-container').append(`<div class="mx-1 row border py-2" id="actionBar">
                <i class="col text-center fs-5 fa fa-edit text-success" aria-hidden="true" data-id="${$(this).attr('id')}" data-message="${($(this).children('pre').html()).split('<')[0]}"></i>
                <i class="col text-center fs-5 fa fa-copy text-primary" aria-hidden="true" data-message="${($(this).children('pre').html()).split('<')[0]}"></i>
                <i class="col text-center fs-5 fa fa-trash fa-trash-group text-danger" aria-hidden="true" data-id="${$(this).attr('id')}"></i>
                <i class="col text-center fa fa-close text-secondary" aria-hidden="true"></i>
            </div>`);
            scrollChatsDown();
        }
    });

    // show action bar for receiver chat 
    $(document).on('mousedown', '.group-chat', function () {
        mousedown = (new Date()).getTime();
    });
    $(document).on('mouseup', '.group-chat', function () {
        mouseup = (new Date()).getTime();
        if ((mouseup - mousedown) / 1000 > 2) {
            if ($('#actionBar')) {
                $('#actionBar').remove();
            }
            $('#group-chat-container').append(`<div class="mx-1 row border py-2" id="actionBar">
                <i class="col text-center fs-5 fa fa-copy text-primary" aria-hidden="true" data-message="${($(this).children('pre').html()).split('<')[0]}"></i>
                <i class="col text-center fa fa-close text-secondary" aria-hidden="true"></i>
            </div>`);
            scrollChatsDown();
        }
    });


});

// To scroll chats down
function scrollChatsDown() {
    $('#group-chat-container').animate({
        scrollTop: $('#group-chat-container').offset().top + $('#group-chat-container')[0].scrollHeight
    }, 0);
}

// response update user online status
socket.on('getOnlineStatus', (response) => {
    if (response.status) {
        if (response.data.status) {
            $("#" + ((response.data.user_email).split(/[.@]/)).join('-') + "-status").text('Online');
            $("#" + ((response.data.user_email).split(/[.@]/)).join('-') + "-status").removeClass('bg-danger');
            $("#" + ((response.data.user_email).split(/[.@]/)).join('-') + "-status").addClass('bg-success');
            $("#" + ((response.data.user_email).split(/[.@]/)).join('-') + "-time").html('');
        } else {
            let time = `Last Seen ${(new Date(response.data.lastSeenAt)).toLocaleString()}`;
            $("#" + ((response.data.user_email).split(/[.@]/)).join('-') + "-status").text('Offline');
            $("#" + ((response.data.user_email).split(/[.@]/)).join('-') + "-status").removeClass('bg-success');
            $("#" + ((response.data.user_email).split(/[.@]/)).join('-') + "-status").addClass('bg-danger');
            $("#" + ((response.data.user_email).split(/[.@]/)).join('-') + "-time").html(time);
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
        });
    }
});

// save user's chat
$('#group_send_message').click(function (event) {
    event.preventDefault();
    let message = $('#group_message').val();
    let groupChatId = $('#group_chat_id').val();
    if (!message) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter a message.',
        });
    } else {
        let chat = {
            sender,
            group,
            message,
            groupChatId
        };
        socket.emit('sendGroupChat', chat);
    }
});

// response send user's chat
socket.on('sendGroupChat', (response) => {
    if (response.status) {
        $('#group_message').val('');
        $('#group_chat_id').val('');
        if (response.data.isUpdate) {
            let chat = response.data.sql.message;
            let time = (new Date(response.data.sql.updatedAt)).toLocaleTimeString();
            let chatId = response.data.sql.id;
            let image = response.data.sql.user.image;
            let element = document.getElementById(`${chatId}`);
            let html = `<div>
                            <img class="mb-2 rounded-circle" src="${image}" style="height: 38px; width: 38px;" alt="User's DP">
                            <span class="user_name text-success">You</span>
                        </div>
                        <pre class="d-inline-block fw-bold border text-success rounded py-1 px-2 text-start">${chat}<sub class="time ms-2">${time}</sub></pre>`;
            element.innerHTML = html;
            $('#actionBar').remove();
        } else {
            let chat = response.data.sql.message;
            let time = (new Date(response.data.sql.updatedAt)).toLocaleTimeString();
            let chatId = response.data.sql.id;
            let image = response.data.sql.user.image;
            let html = `<div class="sender-chat text-end m-2 pe-1" id="${chatId}">
                            <div>
                                <img class="mb-2 rounded-circle" src="${image}" style="height: 38px; width: 38px;" alt="User's DP">
                                <span class="user_name text-success">You</span>
                            </div>
                            <pre class="d-inline-block fw-bold border text-success rounded py-1 px-2 text-start">${chat}<sub class="time ms-2">${time}</sub></pre>
                        </div>`;
            $('#group-chat-container').append(html);
            scrollChatsDown();
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: response.message,
        });
    }
});

// received New Chat
socket.on('receivedNewGroupChat', (response) => {
    if (response.status) {
        if (group == response.data.group && sender != response.data.sender) {
            if (response.data.isUpdate) {
                let chat = response.data.sql.message;
                let time = (new Date(response.data.sql.updatedAt)).toLocaleTimeString();
                let chatId = response.data.sql.id;
                let user = response.data.sql.user;
                let element = document.getElementById(`${chatId}`);
                let html = `<div>
                                <img class="mb-2 rounded-circle" src="${user.image}" style="height: 38px; width: 38px;" alt="User's DP">
                                <span class="user_name text-primary">${user.name}</span>
                            </div>
                            <pre class="d-inline-block fw-bold border text-primary rounded py-1 px-2">${chat}<sub class="time ms-2">${time}</sub></pre>`;
                element.innerHTML = html;
            } else {
                let chat = response.data.sql.message;
                let time = (new Date(response.data.sql.updatedAt)).toLocaleTimeString();
                let chatId = response.data.sql.id;
                let user = response.data.sql.user;
                let html = `<div class="group-chat text-start m-2 ps-1" id="${chatId}">
                            <div>
                                <img class="mb-2 rounded-circle" src="${user.image}" style="height: 38px; width: 38px;" alt="User's DP">
                                <span class="user_name text-primary">${user.name}</span>
                            </div>
                            <pre class="d-inline-block fw-bold border text-primary rounded py-1 px-2">${chat}<sub class="time ms-2">${time}</sub></pre>                    
                        </div>`;
                $('#group-chat-container').append(html);
                scrollChatsDown();
            }
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: response.message,
        });
    }
});

// load Old Chat 
socket.on('loadOldGroupChat', (response) => {
    if (response.status) {
        $('#group-chat-container').html('');
        let chats = response.data.sql;
        let html = '';
        chats.forEach(chat => {
            let addDivClass = "";
            let addH5Class = "";
            let chatMessage = chat.message;
            let chatId = "";
            let user = "";
            let time = (new Date(chat.updatedAt)).toLocaleTimeString();
            let image = chat.user.image;
            if (chat.sender_id == senderId) {
                addDivClass = "sender-chat text-end m-2 pe-1";
                addH5Class = "text-success";
                chatId = chat.id;
                user = 'You';
            } else {
                addDivClass = "group-chat text-start m-2 ps-1";
                addH5Class = "text-primary";
                chatId = chat.id;
                user = chat.user.name;
            }
            html += `<div class="${addDivClass}" id="${chatId}">
                        <div>
                            <img class="mb-2 rounded-circle" src="${image}" style="height: 38px; width: 38px;" alt="User's DP">
                            <span class="user_name ${addH5Class}">${user}</span>
                        </div>
                        <pre class="d-inline-block fw-bold border ${addH5Class} rounded py-1 px-2 text-start">${chatMessage}<sub class="time ms-2">${time}</sub></pre>                    
                    </div>`;
        });
        $('#group-chat-container').append(html);
        scrollChatsDown();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: response.message,
        });
    }
});

// delete sender chat response
socket.on('deleteGroupChat', (response) => {
    if (response.status) {
        let chatId = response.data.id;
        $(`#${chatId}`).remove();
        Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
        );
        $('#actionBar').remove();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: response.message,
        });
    }
});

// remove user chat response
socket.on('removeGroupChat', (response) => {
    if (response.status) {
        if (response.data.sender != sender) {
            let chatId = response.data.id;
            $(`#${chatId}`).remove();
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: response.message,
        });
    }
});

// < --------------------------------------------------- End group chat script ------------------------------------------------ >