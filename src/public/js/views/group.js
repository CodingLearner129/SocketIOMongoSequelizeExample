const submit = document.querySelector("#submitCreateGroup");
const form = document.querySelector("#createGroup");
let errorMessage = document.getElementById("error");
let errorMemberMessage = document.getElementById("errorMessage");
let errorDeleteMessage = document.getElementById("deleteError");
let successMessage = document.getElementById("success");
successMessage.style.display = "none";
errorMessage.style.display = "none";
errorMemberMessage.style.display = "none";
errorDeleteMessage.style.display = "none";

$(document).on("click", "#closeCreateGroup", function () {
    form.reset();
});

// update group
$(document).on("click", ".updateGroupModal", function () {
    const group = JSON.parse($(this).attr("data-obj"));
    $("#groupId").val($(this).attr("data-id"));
    $("#last_limit").val(group.limit);
    $("#createGroupModalLabel").html("Update Group");
    $("#name").val(group.name);
    $("#limit").val(group.limit);
});

// delete group
$(document).on("click", ".deleteGroupButton", function () {
    $("#deleteGroupId").val($(this).attr("data-id"));
    $("#deleteGroupName").html($(this).attr("data-name"));
    $("#deleteGroupLimit").val($(this).attr("data-limit"));
});

// create group
submit.addEventListener("click", function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    let group_id = $("#groupId").val();
    axios({
        method: group_id == "" ? "POST" : "PATCH",
        url,
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
        .then((response) => {
            //handle success
            if (response.data.status) {
                if (response.data.isUpdate == true) {
                    form.reset();
                    errorMessage.style.display = "none";
                    successMessage.style.display = "block";
                    successMessage.innerHTML = "";
                    successMessage.innerHTML += `<p class="text-center">${response.data.message}</p>`;
                    $("#closeCreateGroup").click();
                    location.reload();
                } else if (response.data.isUpdate == false) {
                    form.reset();
                    errorMessage.style.display = "none";
                    successMessage.style.display = "block";
                    successMessage.innerHTML = "";
                    successMessage.innerHTML += `<p class="text-center">${response.data.message}</p>`;
                    const key = $("#groupList").children().length;
                    const group = response.data.data;
                    let html = `<tr id="${group.id}">
                        <td class="text-center">${ (key == 1 && $("#groupList").children("tr")[0].id == "") ? key : key + 1}</td>
                        <td class="text-center"><img class="rounded-circle" src="${group.image}" style="height: 38px; width: 38px;" alt="Group's DP"></td>
                        <td class="text-center">${group.name}</td>
                        <td class="text-center">${group.limit}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-primary showMember" data-id="${group.id
                            }" data-limit="${group.limit}" data-bs-toggle="modal" data-bs-target="#groupMemberModal">
                                Members
                            </button>
                        </td>
                        <td class="text-center">
                            <button type="button" class="btn btn-primary updateGroupModal" data-id="${group.id }" data-obj='${JSON.stringify(group)}' data-bs-toggle="modal" data-bs-target="#createGroupModal">
                                Update
                            </button>
                            <button type="button" class="btn btn-danger deleteGroupButton" data-id="${ group.id }"
                                data-name="${ group.name }" data-limit="${ group.limit }" data-bs-toggle="modal"
                                data-bs-target="#deleteGroupModal">
                                Delete
                            </button>
                            <button type="button" class="btn btn-success copyGroupButton" data-id="${ group.id }">
                                Copy
                            </button>
                        </td>
                    </tr>`;
                    (key == 1 && $("#groupList").children("tr")[0].id == "") ? $("#groupList").html(html) : $("#groupList").append(html);
                    $("#closeCreateGroup").click();
                }
            } else {
                successMessage.style.display = "none";
                errorMessage.style.display = "block";
                errorMessage.innerHTML = "";
                errorMessage.innerHTML += `<p class="text-center">${response.data.message}</p>`;
            }
        })
        .catch((error) => {
            //handle error
            successMessage.style.display = "none";
            errorMessage.style.display = "block";
            errorMessage.innerHTML = "";
            if (typeof error.response.data.error == "string") {
                errorMessage.innerHTML += `<p class="text-center">${error.response.data.error}</p>`;
            } else if (Object.keys(error.response.data.error.errors).length > 0) {
                Object.values(error.response.data.error.errors).forEach((element) => {
                    errorMessage.innerHTML += `<p class="text-center">${element.message}</p>`;
                });
            } else if (Object.keys(error.response.data.error).length > 0) {
                Object.values(error.response.data.error).forEach((element) => {
                    console.log(element);
                    errorMessage.innerHTML += `<p class="text-center">${element.message}</p>`;
                });
            } else {
                errorMessage.innerHTML += `<p class="text-center">${error.response.data.message}</p>`;
            }
        })
        .finally(() => {
            setTimeout(() => {
                successMessage.style.display = "none";
                errorMessage.style.display = "none";
            }, 2000);
        });
});

$(document).on('click', '.copyGroupButton', function () {
    const group_id = $(this).attr('data-id');
    const url = window.location.protocol + '//' + window.location.host + '/group-share/' + group_id;
    const $temp = $("<input>");
    $("body").append($temp);
    $temp.val(url).select();
    document.execCommand("copy");
    $temp.remove();
});

// get members
$(document).on("click", ".showMember", function () {
    $("#group_id").val($(this).attr("data-id"));
    $("#group_limit").val($(this).attr("data-limit"));

    axios({
        method: "POST",
        url: memberUrl,
        data: {
            group_id: $("#group_id").val(),
        },
    })
        .then((response) => {
            //handle success
            if (response.data.status) {
                errorMemberMessage.style.display = "none";
                let html = ``;
                let users = response.data.data;
                users.forEach((user) => {
                    html += `<tr>
                            <td>
                                <input type="checkbox" ${user.members.length > 0
                            ? "checked"
                            : ""
                        } name="members[]" value="${user.id
                        }"/>
                            </td>
                            <td>${user.name}</td>
                        </tr>`;
                });
                $("#memberList").html(html);
            } else {
                successMessage.style.display = "none";
                errorMemberMessage.style.display = "block";
                errorMemberMessage.innerHTML = "";
                errorMemberMessage.innerHTML += `<p class="text-center">${response.message}</p>`;
            }
        })
        .catch((error) => {
            //handle error
            successMessage.style.display = "none";
            errorMemberMessage.style.display = "block";
            errorMemberMessage.innerHTML = "";
            if (typeof error.response.data.error == "string") {
                errorMemberMessage.innerHTML += `<p class="text-center">${error.response.data.error}</p>`;
            } else if (Object.keys(error.response.data.error).length > 0) {
                Object.values(error.response.data.error).forEach((element) => {
                    errorMemberMessage.innerHTML += `<p class="text-center">${element.message}</p>`;
                });
            } else {
                errorMemberMessage.innerHTML += `<p class="text-center">${error.response.data.message}</p>`;
            }
        })
        .finally(() => {
            setTimeout(() => {
                successMessage.style.display = "none";
                errorMemberMessage.style.display = "none";
            }, 2000);
        });
});

// update group members
const updateGroupMember = document.getElementById("updateGroupMember");
updateGroupMember.addEventListener("click", function (e) {
    e.preventDefault();
    const formData = $("#groupMember").serialize();

    axios({
        method: "PUT",
        url: memberUrl,
        data: formData,
    })
        .then((response) => {
            //handle success
            if (response.data.status) {
                document.getElementById("groupMember").reset();
                errorMemberMessage.style.display = "none";
                let html = ``;
                let members = response.data.data;
                // members.forEach((member) => {
                //     html += `<tr>
                //             <td>
                //                 <input type="checkbox" name="members[]" value="${member.id}"/>
                //             </td>
                //             <td>${member.name}</td>
                //         </tr>`;
                // });
                // $('#memberList').html(html);
                $("#closeGroupMember").click();
            } else {
                successMessage.style.display = "none";
                errorMemberMessage.style.display = "block";
                errorMemberMessage.innerHTML = "";
                errorMemberMessage.innerHTML += `<p class="text-center">${response.message}</p>`;
            }
        })
        .catch((error) => {
            //handle error
            successMessage.style.display = "none";
            errorMemberMessage.style.display = "block";
            errorMemberMessage.innerHTML = "";
            if (typeof error.response.data.error == "string") {
                errorMemberMessage.innerHTML += `<p class="text-center">${error.response.data.error}</p>`;
            } else if (Object.keys(error.response.data.error).length > 0) {
                Object.values(error.response.data.error).forEach((element) => {
                    errorMemberMessage.innerHTML += `<p class="text-center">${element.message}</p>`;
                });
            } else {
                errorMemberMessage.innerHTML += `<p class="text-center">${error.response.data.message}</p>`;
            }
        })
        .finally(() => {
            setTimeout(() => {
                successMessage.style.display = "none";
                errorMemberMessage.style.display = "none";
            }, 2000);
        });
});
const submitDeleteGroup = document.getElementById("submitDeleteGroup");
submitDeleteGroup.addEventListener("click", function (e) {
    e.preventDefault();

    axios({
        method: "DELETE",
        url,
        data: {
            group_id: $("#deleteGroupId").val(),
            limit: $("#deleteGroupLimit").val(),
        },
    })
        .then((response) => {
            //handle success
            if (response.data.status) {
                document.getElementById("deleteGroup").reset();
                errorDeleteMessage.style.display = "none";
                successMessage.style.display = "block";
                successMessage.innerHTML = "";
                successMessage.innerHTML += `<p class="text-center">${response.data.message}</p>`;
                $("#closeDeleteGroup").click();
                location.reload();
            } else {
                successMessage.style.display = "none";
                errorDeleteMessage.style.display = "block";
                errorDeleteMessage.innerHTML = "";
                errorDeleteMessage.innerHTML += `<p class="text-center">${response.message}</p>`;
            }
        })
        .catch((error) => {
            //handle error
            successMessage.style.display = "none";
            errorDeleteMessage.style.display = "block";
            errorDeleteMessage.innerHTML = "";
            if (typeof error.response.data.error == "string") {
                errorDeleteMessage.innerHTML += `<p class="text-center">${error.response.data.error}</p>`;
            } else if (Object.keys(error.response.data.error).length > 0) {
                Object.values(error.response.data.error).forEach((element) => {
                    errorDeleteMessage.innerHTML += `<p class="text-center">${element.message}</p>`;
                });
            } else {
                errorDeleteMessage.innerHTML += `<p class="text-center">${error.response.data.message}</p>`;
            }
        })
        .finally(() => {
            setTimeout(() => {
                successMessage.style.display = "none";
                errorDeleteMessage.style.display = "none";
            }, 2000);
        });
});