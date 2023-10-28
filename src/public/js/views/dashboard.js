let receiver, receiverId;
// socket connection
let socket = io('/user-namespace', {
    auth: {
        token: sender// right now I haven't implemented JWT so I simply pass user email as token 
    }
});

// < --------------------------------------------------- Start one to one chat script ------------------------------------------------ >

$(document).ready(function () {
    // load chat of particular user
    $('.user_list').click(function () {
        receiver = $(this).attr('data-id');
        receiverId = $(this).attr('data-attr');
        $('.start-head').hide();
        $('.chat-section').show();
        socket.emit('loadOldChat', {
            sender,
            receiver,
        });
    });

    // remove action bar
    $(document).on('click', '.fa-close', function () {
        $('#actionBar').remove();
    });


    // delete user chat
    $(document).on('click', '.fa-trash', function () {
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
                    receiver,
                    id: chatId
                };
                socket.emit('deleteUserChat', chat);
            }
        });
    });

    // edit user chat
    $(document).on('click', '.fa-edit', function () {
        let chatId = $(this).attr('data-id');
        let chatMessage = $(this).attr('data-message');
        $('#chat_id').val(chatId);
        $('#message').val(chatMessage);
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
            $('#chat-container').append(`<div class="mx-1 row border py-2" id="actionBar">
                <i class="col text-center fs-5 fa fa-edit text-success" aria-hidden="true" data-id="${$(this).attr('id')}" data-message="${($(this).children('pre').html()).split('<')[0]}"></i>
                <i class="col text-center fs-5 fa fa-copy text-primary" aria-hidden="true" data-message="${($(this).children('pre').html()).split('<')[0]}"></i>
                <i class="col text-center fs-5 fa fa-trash text-danger" aria-hidden="true" data-id="${$(this).attr('id')}"></i>
                <i class="col text-center fa fa-close text-secondary" aria-hidden="true"></i>
            </div>`);
            scrollChatsDown();
        }
    });

    // show action bar for receiver chat 
    $(document).on('mousedown', '.receiver-chat', function () {
        mousedown = (new Date()).getTime();
    });
    $(document).on('mouseup', '.receiver-chat', function () {
        mouseup = (new Date()).getTime();
        if ((mouseup - mousedown) / 1000 > 2) {
            if ($('#actionBar')) {
                $('#actionBar').remove();
            }
            $('#chat-container').append(`<div class="mx-1 row border py-2" id="actionBar">
                <i class="col text-center fs-5 fa fa-copy text-primary" aria-hidden="true" data-message="${($(this).children('pre').html()).split('<')[0]}"></i>
                <i class="col text-center fa fa-close text-secondary" aria-hidden="true"></i>
            </div>`);
            scrollChatsDown();
        }
    });


});

// To scroll chats down
function scrollChatsDown() {
    $('#chat-container').animate({
        scrollTop: $('#chat-container').offset().top + $('#chat-container')[0].scrollHeight
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
$('#send_message').click(function (event) {
    event.preventDefault();
    let message = $('#message').val();
    let chatId = $('#chat_id').val();
    if (!message) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter a message.',
        });
    } else {
        let chat = {
            sender,
            receiver,
            message,
            chatId
        };
        socket.emit('sendUserChat', chat);
    }
});

// response send user's chat
socket.on('sendUserChat', (response) => {
    if (response.status) {
        $('#message').val('');
        $('#chat_id').val('');
        if (response.data.isUpdate) {
            let chat = response.data.sql.message;
            let time = (new Date(response.data.sql.updatedAt)).toLocaleTimeString();
            let chatId = response.data.sql.id;
            let element = document.getElementById(`${chatId}`);
            let html = `<pre class="d-inline-block fw-bold border text-success rounded py-1 px-2 text-start">${chat}<sub class="time ms-2">${time}</sub></pre>`;
            element.innerHTML = html;
            $('#actionBar').remove();
        } else {
            let chat = response.data.sql.message;
            let time = (new Date(response.data.sql.updatedAt)).toLocaleTimeString();
            let chatId = response.data.sql.id;
            let html = `<div class="sender-chat text-end m-2 pe-1" id="${chatId}">
                            <pre class="d-inline-block fw-bold border text-success rounded py-1 px-2 text-start">${chat}<sub class="time ms-2">${time}</sub></pre>
                        </div>`;
            $('#chat-container').append(html);
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
socket.on('receivedNewChat', (response) => {
    if (response.status) {
        if (sender == response.data.receiver && receiver == response.data.sender) {
            if (response.data.isUpdate) {
                let chat = response.data.sql.message;
                let time = (new Date(response.data.sql.updatedAt)).toLocaleTimeString();
                let chatId = response.data.sql.id;
                let element = document.getElementById(`${chatId}`);
                let html = `<pre class="d-inline-block fw-bold border text-primary rounded py-1 px-2">${chat}<sub class="time ms-2">${time}</sub></pre>`;
                element.innerHTML = html;
            } else {
                let chat = response.data.sql.message;
                let time = (new Date(response.data.sql.updatedAt)).toLocaleTimeString();
                let chatId = response.data.sql.id;
                let html = `<div class="receiver-chat text-start m-2 ps-1" id="${chatId}">
                            <pre class="d-inline-block fw-bold border text-primary rounded py-1 px-2">${chat}<sub class="time ms-2">${time}</sub></pre>                    
                        </div>`;
                $('#chat-container').append(html);
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
socket.on('loadOldChat', (response) => {
    if (response.status) {
        $('#chat-container').html('');
        let chats = response.data.sql;
        let html = '';
        chats.forEach(chat => {
            let addDivClass = "";
            let addH5Class = "";
            let chatMessage = chat.message;
            let chatId = "";
            let time = (new Date(chat.updatedAt)).toLocaleTimeString();
            if (chat.sender_id == senderId) {
                addDivClass = "sender-chat text-end m-2 pe-1";
                addH5Class = "text-success";
                chatId = chat.id;
            } else {
                addDivClass = "receiver-chat text-start m-2 ps-1";
                addH5Class = "text-primary";
                chatId = chat.id;
            }
            html += `<div class="${addDivClass}" id="${chatId}">
                        <pre class="d-inline-block fw-bold border ${addH5Class} rounded py-1 px-2 text-start">${chatMessage}<sub class="time ms-2">${time}</sub></pre>                    
                    </div>`;
        });
        $('#chat-container').append(html);
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
socket.on('deleteUserChat', (response) => {
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
socket.on('removeUserChat', (response) => {
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

// < --------------------------------------------------- End one to one chat script ------------------------------------------------ >