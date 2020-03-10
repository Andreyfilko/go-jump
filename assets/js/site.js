/*
 * Translated default messages for the jQuery validation plugin.
 * Locale: RU (Russian; русский язык)
 */
$.extend( $.validator.messages, {
    required: "Это поле необходимо заполнить.",
    remote: "Пожалуйста, введите правильное значение.",
    email: "Пожалуйста, введите корректный адрес электронной почты.",
    url: "Пожалуйста, введите корректный URL.",
    date: "Пожалуйста, введите корректную дату.",
    dateISO: "Пожалуйста, введите корректную дату в формате ISO.",
    number: "Пожалуйста, введите число.",
    digits: "Пожалуйста, вводите только цифры.",
    creditcard: "Пожалуйста, введите правильный номер кредитной карты.",
    equalTo: "Пожалуйста, введите такое же значение ещё раз.",
    extension: "Пожалуйста, выберите файл с правильным расширением.",
    maxlength: $.validator.format( "Пожалуйста, введите не больше {0} символов." ),
    minlength: $.validator.format( "Пожалуйста, введите не меньше {0} символов." ),
    rangelength: $.validator.format( "Пожалуйста, введите значение длиной от {0} до {1} символов." ),
    range: $.validator.format( "Пожалуйста, введите число от {0} до {1}." ),
    max: $.validator.format( "Пожалуйста, введите число, меньшее или равное {0}." ),
    min: $.validator.format( "Пожалуйста, введите число, большее или равное {0}." )
} );

function serializeToObject(form) {
    let result = {};
    const data = $(form).serializeArray();

    data.forEach(row => result[row.name] = row.value);

    return result;
}

function getFormattedMessage({user_name, phone_number, user_count, message}) {
    return `
<b>Имя пользователя:</b> ${user_name || 'Не указано'}
<b>Телефон:</b> ${phone_number}
<b>Количество людей:</b> ${user_count}
<b>Комментарий:</b> ${message || '-'}`;
}

$("#bookingForm").validate({
    rules: {
        phone_number: {
            required: true,
            digits: true,
            minlength: 7
        }
    },
    submitHandler: function(form) {
        $.get( `https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id,
            text: getFormattedMessage(serializeToObject(form)),
            parse_mode: 'HTML'
        }, function( data ) {
            if(data.ok) {
                // show popup
                alert('Ваша заявка приятна и будет обработана в ближайшее время.\nМы с вами свяжемся.');
                form.reset();
            } else {
                // show error
            }
        });
    }
});