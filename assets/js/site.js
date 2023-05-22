function serializeToObject(form) {
    let result = {};
    const data = $(form).serializeArray();

    data.forEach(row => result[row.name] = row.value);

    return result;
}

function getFormattedMessage({user_name, phone_number, user_count, message}, form_name = 'Имя Формы') {
    let template = `
<pre>${form_name}</pre>

<b>Прізвише Ім'я:</b> ${user_name || 'Не указано'}
<b>Телефон:</b> ${phone_number}\n`;

    template += `<b>Кількість людей:</b> ${user_count || '-'}\n`;

    template += `<b>Коментарій:</b> ${message || '-'}`;

    return template;
}

function telegramSend(form, order_id) {
    let name = $(form).attr('name');

    if(order_id) {
        name += `\r\nЗаказ: ${order_id}`;
    }

    return $.get( `https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id,
        text: getFormattedMessage(serializeToObject(form), name),
        parse_mode: 'HTML'
    });
}

function processBookForm(form) {
    const formData = serializeToObject(form);

    if(formData.pay_type) {
        processPayment(formData, form)
    } else {
        telegramSend(form).done(data => {
            if(data.ok) {
                // show popup
                showAlert('Ваша заявка прийня та буде опрацьована в найближчій час.\nМи з вами зв'яжемося.');
                form.reset();
            } else {
                // show error
            }
        });
    }
}


function processPayment(formData, form) {
    const paymentData = payment[formData.pay_type];
    paymentData.amount = getCountAmount(formData);

    $.get( `https://filko.dev/go-jump/`, paymentData).done(paymentFormData => {

        if(confirm(`Для безпечної оплати ви будете перенаправлені на сервіс liqpay.ua\rНомер Вашого замовлення: ${paymentFormData.order_id}`)) {

            telegramSend(form, paymentFormData.order_id).done(data => {
                if(data.ok) {
                    $(getHtmlPayForm(paymentFormData)).appendTo('body').submit();
                } else {
                    showAlert('Виникла помилка.');
                }
            });
        }
    });
}

function getCountAmount(formData) {
    const user_count = parseInt(formData.user_count, 10);
    const price = payment[formData.pay_type].amount;

    if(!user_count) {
        return price;
    }

    if(formData.pay_type.includes('tandem')) {
        return price * ((user_count + user_count%2) / 2);
    }

    return price * user_count;
}

function getHtmlPayForm(formData) {
    return `
            <form method="POST" action="${formData.url}" accept-charset="utf-8">
                <input type="hidden" name="data" value="${formData.data}" />
                <input type="hidden" name="signature" value="${formData.signature}" />
            </form>
            `;
}

function showAlert(message) {
    if(!message) {
        return;
    }

    // close all visible modals
    $('.modal:visible').each((i, modal) => $(modal).hide());

    const modalId = '#modal_AlertModal';

    $(modalId).find('.modal-body').html(message);
    $(modalId).show();
}

$(function () {
// Modal open button
    $('[data-modal]').click(function (button) {
        const modalId = '#modal_' + $(this).data('modal');
        $(modalId).show();
    });

    // Modal close button
    $('.modal .close').click(function () {
        $(this).closest('.modal').hide();
    });

    $('.modal').click(function (event) {
        if(!$(event.target).closest(".modal-content").length) {
            $(this).hide();
        }
    });
});
