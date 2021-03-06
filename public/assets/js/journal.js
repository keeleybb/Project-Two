/* eslint-disable no-use-before-define */
$(".modal").modal();
$("select").formSelect();
$("#modal1").modal("open");

//Page variables
const titleInput = $("#title");
const bodyInput = $("#body");
const authId = $("#journal-save").data("authid");
// console.log(authId);
// eslint-disable-next-line no-unused-vars
let mood;
let moodnum;

//Saving the mood for later use
$("#mood").on("click", function (event) {
    event.preventDefault();
    mood = $("#select-mood").val();
    moodnum = $("#select-mood").find(":selected").data("num");
    console.log(mood);
    console.log(moodnum);
    $("#modal1").modal("close");
});


//Submitting new journal entry
$("#journal").on("submit", handleFormSubmit);

// A function for handling what happens when the form to create a new post is submitted
function handleFormSubmit(event) {
    event.preventDefault();
    console.log(authId);
    // Don't submit empty posts
    if (!titleInput.val().trim() || !bodyInput.val().trim() || !moodnum || !authId) {
        alert("You're missing something...");
        $("#modal1").modal("open");
        return;
    }
    // Constructing a newPost object to hand to the database
    var newPost = {
        title: titleInput
            .val()
            .trim(),
        body: bodyInput
            .val()
            .trim(),
        MoodId: moodnum,
        UserId: authId
    };
    console.log("author Id: ", authId);
    console.log("New Post: ", newPost);
    submitPost(newPost);
}

// Submits a new post -- need to bring people to the journal page upon completion
function submitPost(post) {
    $.post("/api/posts", post, function () {
        $.get("/api/user_data").then(function (data) {
            window.location.assign(`/${data.username}/posts`);
        });
    });
}


//Redirect to Post page
$(".post-link").on("click", function (event) {
    event.preventDefault();
    $.get("/api/user_data").then(function (data) {
        window.location.assign(`/${data.username}/posts`);
    });
});

//Post Page

//Redirects
$(".journal-link").on("click", function (event) {
    event.preventDefault();
    $.get("/api/user_data").then(function (data) {
        console.log(data.username);
        window.location.replace(`/${data.username}/journal`);
    });
});

$.get("/api/user_data").then(function (data) {
    console.log("user: ", data.username);
});

//Note Viewing Modal
var $postTitle = $(".post-title");
var $postText = $(".post-textarea");
var $postList = $(".post-group");
var $postDate = $(".dateCreated");
let activePost;

// Sets the activePost and displays it
const handlePostView = function () {
    activePost = $(this).data("num");
    console.log("activePost Id: ", activePost);

    $.get("/api/posts/" + activePost).then(function (data) {
        console.log(data);
        $postTitle.text(data.title);
        $postText.val(data.body);
        $postDate.val(data.CreatedAt);
        console.log(data.Mood.mood);

        //Added to trigger gradient.js
        gradientSelection(data.Mood.mood);

        //Set the id for the buttons
        $("#saving").attr("data-postid", data.id);
        $("#deleting").attr("data-postid", data.id);
        // var testing = $('#deleting').data("postid");
        // console.log("PostId: ", testing);

        //Saving for added functionality later
        if (data.Mood) {
            console.log("Mood Id: ", data.Mood.id);
            //remove selected one
            // $('option:selected', 'select[name="mood-options"]').removeAttr('selected');
            //Using the value
            // $(`select[name="mood-options"]).find('option[value="${data.Mood.id}"]'`).attr("selected", true);
            // const select = $('[name=mood-options]').val(data.Mood.id).attr('selected', 'selected');

            // console.log(select);
            // $("#select-mood").val("default");
            // $("#select-mood").val(data.Mood.id);

            // $(`#select-mood option[value=default]`).attr('selected', 'deselected');
            // var display = $(`#select-mood option[value=${data.Mood.id}]`).attr('selected', 'selected');
            // console.log(display);
            // $("#select-mood").val(data.Mood.id).change();
        }
        $("#modal3").modal("open");
    });

};

// $postList.on("click", ".post-list", handlePostView);

// cindy's edit method
$(".edit").on("click", function (event) {
    event.stopPropagation();
    console.log("data-id", $(this).data("id"));
    const id = $(this).data("id");

    $.get(`/api/posts/${id}`).then(function (data) {
        console.log(data);
        $postTitle.text(data.title);
        $postText.val(data.body);
        $postDate.val(data.CreatedAt);
        console.log(data.Mood.mood);

        //Added to trigger gradient.js
        gradientSelection(data.Mood.mood);

        //Set the id for the buttons
        $("#saving").attr("data-postid", data.id);
        $("#deleting").attr("data-postid", data.id);

        //Saving for added functionality later
        if (data.Mood) {
            console.log("Mood Id: ", data.Mood.id);
        }
        $("#modal3").modal("open");
    });
});

// cindy's comment stuff
$("button.comments").on("click", function (event) {
    event.stopPropagation();
    console.log("data-id", $(this).data("id"));

    const dataId = $(this).data("id");
    // console.log("hit");

    const idNum = function (id) {
        return id;
    };
    const targetId = idNum(dataId)
    // console.log("trying to return data id as num", targetId);

    const target = $(`.${targetId}`)

    const hiddenComms = target.children();

    if (target.attr("style") === "display: none;") {
        target.show("slow", () => {

            hiddenComms.fadeIn("slow");
        })
    } else {
        target.hide("slow", () => {
            hiddenComms.fadeOut("fast");

        })
    }
})

$(".new-comm").on("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    // console.log($(this).data("id"));

    // console.log($(".comm-text").val());
    const dataId = $(this).data("id");

    const idNum = function (id) {
        return id;
    };

    const id = idNum(dataId);
    console.log(id)

    const commVal = $(`.comm-text.${id}`).val()
    // console.log(commVal);
    const comment = {
        body: commVal,
        PostId: id
    };

    // console.log(comment);
    
    $.post("/api/comments", comment).then(function (comment) {
        console.log("new comment data", comment);
        window.location.reload();
        // $(`.comm-text.${id}`).val("");
        // $(`.comments.comm-id-${id}`).before(`
        //     <ul class="relative commid-${comment.id}">
        //         <li style="visibility: hidden;" class="comm-id-${comment.id}">${comment.id}</li>
        //         <li class="comm-body-${comment.id}">${comment.body}</li>
        //     <li class="comm-timestamp-${comment.id}">${comment.createdAt}<button style="font-size: 20px" class="comm-del material-icons md-light transp" data-id='${comment.id}'>delete</button></li>
        //     </ul>
        // `)

    });
});

$(".post-block").on("click", function () {
    const moodChange = $(this).find(".mood-span")[0].innerText;
    gradientSelection(moodChange);
});

$(".comm-del").on("click", function (event) {
    const id = $(this).data("id");

    // const postId = $(this).parents(".post-block").data("post");
    // console.log("this", $(this).parents(".post-block").data("post"));
    // console.log("delete id:", id);

    $.ajax({
        url: `/api/comments/${id}`,
        method: "DELETE"
    }).then(() => {
        const removeComm = $(`.commid-${id}`);

        removeComm.remove();

        // window.location.reload();
    });
});
// this ends cindy's stuff

$("#deleting").on("click", function () {
    event.preventDefault();
    var a = $("#deleting").data("postid");
    console.log("post id: ", a);

    $.ajax({
        url: "/api/posts/" + a,
        method: "DELETE",
        success: function () {
            // console.log("delete response", response);
            $('#modal3').modal('close');
            // window.location.reload();
            $(`.postid-${a}`).fadeOut();
        }
    });

});

$("#saving").on("click", function () {
    event.preventDefault();
    console.log("clicked");
    var a = $("#saving").data("postid");
    console.log("Post Id:", a);
    console.log("PostText Object:", $postText);
    var postText = $postText.val();
    console.log("Post Text: ", postText);

    // Don't submit empty posts
    if (!postText.trim()) {
        return;
    }

    // Constructing a newPost object to hand to the database
    var newPost = {
        body: postText
    };
    console.log("Updated Post: ", newPost);

    $.ajax({
        url: "/api/posts/" + a,
        method: "PUT",
        data: newPost,
        success: function (response) {
            console.log(response);
            // $('#modal3').modal('close');
            window.location.reload();
        }
    });
});


//Js to make textareas exapndable -- Targets all textareas with class "txta"
let textareas = document.querySelectorAll(".txta"),
    hiddenDiv = document.createElement("div"),
    content = null;

// Adds a class to all textareas
for (let j of textareas) {
    j.classList.add("txtstuff");
}

// Build the hidden div's attributes

// The line below is needed if you move the style lines to CSS
// hiddenDiv.classList.add('hiddendiv');

// Add the "txta" styles, which are common to both textarea and hiddendiv
// If you want, you can remove those from CSS and add them via JS
hiddenDiv.classList.add("txta");

// Add the styles for the hidden div
// These can be in the CSS, just remove these three lines and uncomment the CSS
hiddenDiv.style.display = "none";
hiddenDiv.style.whiteSpace = "pre-wrap";
hiddenDiv.style.wordWrap = "break-word";

// Loop through all the textareas and add the event listener
for (let i of textareas) {
    (function (i) {
        // Note: Use 'keyup' instead of 'input'
        // if you want older IE support
        i.addEventListener("input", function () {

            // Append hiddendiv to parent of textarea, so the size is correct
            i.parentNode.appendChild(hiddenDiv);

            // Remove this if you want the user to be able to resize it in modern browsers
            i.style.resize = "none";

            // This removes scrollbars
            i.style.overflow = "hidden";

            // Every input/change, grab the content
            content = i.value;

            // Add the same content to the hidden div

            // This is for old IE
            content = content.replace(/\n/g, "<br>");

            // The <br ..> part is for old IE
            // This also fixes the jumpy way the textarea grows if line-height isn't included
            hiddenDiv.innerHTML = content + "<br style=\"line-height: 3px;\">";

            // Briefly make the hidden div block but invisible
            // This is in order to read the height
            hiddenDiv.style.visibility = "hidden";
            hiddenDiv.style.display = "block";
            i.style.height = hiddenDiv.offsetHeight + "px";

            // Make the hidden div display:none again
            hiddenDiv.style.visibility = "visible";
            hiddenDiv.style.display = "none";
        });
    })(i);
}

// Dropdown selection
$('.dropdown-trigger').dropdown();
