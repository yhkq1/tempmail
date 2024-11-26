let currentEmail = localStorage.getItem('currentEmail') || '';

function getUserAndDomain() {
    const addr = $("#addr").val();
    if (!addr) {
        alert("Please generate or input an email address first!");
        return null;
    }

    const [user, domain] = addr.split("@");
    return { user, domain };
}

function genEmail() {
    $.getJSON(
        "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1",
        (res) => {
            currentEmail = res[0];
            localStorage.setItem('currentEmail', currentEmail);
            $("#addr").val(currentEmail);
            refreshMail();
        }
    );
}

function refreshMail() {
    const { user, domain } = getUserAndDomain();

    if (!user || !domain) return;

    const emailsElement = $("#emails");
    emailsElement.empty();
    emailsElement.append(`
        <tr>
          <td class="text-center p-6">
            <i class="fas fa-spinner fa-spin text-4xl mb-4"></i>
            <p class="text-lg">Loading...</p>
          </td>
        </tr>
    `);

    $.getJSON(
        `https://www.1secmail.com/api/v1/?action=getMessages&login=${user}&domain=${domain}`,
        (emails) => {
            emailsElement.empty();

            if (emails.length === 0) {
                emailsElement.append(`
                    <tr>
                        <td class="text-center p-6">
                            <i class="fas fa-envelope-open-text text-4xl mb-4"></i>
                            <p class="text-lg">Your inbox is empty</p>
                            <p>Waiting for incoming emails</p>
                        </td>
                    </tr>
                `);
            } else {
                for (const email of emails) {
                    emailsElement.append(`
                        <tr>
                            <td class="p-2 text-xs sm:text-sm break-words">
                                <a href="javascript:void(0)" onclick="viewEmail('${email.id}', '${email.from}', '${email.subject}', '${email.date}')">
                                    ${email.subject} - ${email.from}
                                </a>
                            </td>
                        </tr>
                    `);
                }
            }
        }
    );
}

function viewEmail(id, from, subject, date) {
    const { user, domain } = getUserAndDomain();

    if (!user || !domain) return;

    $.getJSON(
        `https://www.1secmail.com/api/v1/?action=readMessage&login=${user}&domain=${domain}&id=${id}`,
        (email) => {
            const emailContent = `
                <div class="bg-gray-900 text-green-500 p-6 rounded-lg shadow-lg w-full max-w-4xl h-full flex flex-col justify-between fade-in overflow-y-auto">
                    <h3 class="text-xl font-semibold mb-4">From: ${from}</h3>
                    <h4 class="text-lg mb-2">Subject: ${subject}</h4>
                    <p class="text-sm mb-2">Date: ${date}</p>
                    <div class="bg-gray-800 text-gray-400 p-4 rounded-md">
                        <pre>${email.text}</pre>
                    </div>
                </div>
            `;
            $("#menu-content").html(emailContent);
            showFullScreenMenu();
        }
    );
}

function showFullScreenMenu() {
    $("#fullscreen-menu").hide();
    $("#fullscreen-menu-content").fadeIn();
}

function backToMenu() {
    $("#fullscreen-menu-content").fadeOut(() => {
        $("#fullscreen-menu").fadeIn();
    });
}

function closeMenu() {
    $("#fullscreen-menu").fadeOut();
}

function showAbout() {
    $("#menu-content").html(`
        <h1 class="text-2xl mb-4">About</h1>
        <p>Temp Mail is a temporary disposable email service for users who want to avoid spam and secure their personal inboxes. It allows users to generate anonymous email addresses that can be used for a short period.</p>
    `);
    showFullScreenMenu();
}

function showDeveloper() {
    $("#menu-content").html(`
        <h1 class="text-2xl mb-4">Developer</h1>
        <p>Temp Mail was developed by Janis. Follow me on <a href="https://github.com/yhkq1" class="text-blue-500">GitHub</a>.</p>
    `);
    showFullScreenMenu();
}

function showVersion() {
    $("#menu-content").html(`
        <h1 class="text-2xl mb-4">Version</h1>
        <p>Version 1.0 - Initial Release</p>
    `);
    showFullScreenMenu();
}

function copyEmail() {
    const email = $("#addr").val();
    if (email) {
        navigator.clipboard.writeText(email);
        $("#addr").addClass('copy-animation');
        setTimeout(() => {
            $("#addr").removeClass('copy-animation');
        }, 1000);
    }
}

$(document).ready(() => {
    genEmail();
});
