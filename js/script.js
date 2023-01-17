const loadMiembros = function() {
    const dbParam = JSON.stringify({table:"miembros",limit:20});
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function() {
        const myObj = JSON.parse(this.responseText);
        window.miembros = myObj;
        let text = "<option id='select-a-member' value=''>- Select Name -</option>";
        for (let x in myObj) {
            text += "<option value='" + myObj[x].id + "' data-churchid='" + myObj[x].churchid + "' data-subgroup='" + myObj[x].subgroup + "' data-youth='" + myObj[x].youth + "'>" + myObj[x].fullname + "</option>";
        }
        document.getElementById("miembros").innerHTML = text;
    }
    xmlhttp.open("GET", "/../api/app-data.json");
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("x=" + dbParam);
}

function loadSubgroupMembers(id) {
    // Clear
    document.getElementById("miembros").innerHTML = '';
    let text = "<option id='select-a-member' value=''>- Select Name -</option>";
    var myObj = window.miembros;
    for (let x in myObj) {
        if (myObj[x].subgroup == id) {
            text += "<option value='" + myObj[x].id + "' data-churchid='" + myObj[x].churchid + "' data-subgroup='" + myObj[x].subgroup + "' data-youth='" + myObj[x].youth + "'>" + myObj[x].fullname + "</option>";
        }
    }
    document.getElementById("miembros").innerHTML = text;
}

function login() {
    var password = $('#formpassword').val();
    checkPassword(password);
}

var x = 3249;
function checkPassword(p) {
    if (!p) history.go(-1);
    if (h(p) == x) {
        $('#attendance-form-container').show();
        $('#attendance-form-password-container').hide();
        return true;
    }
    document.write('<h1>ACCESS DENIED</h1>');
    return false;
}

function h(string) {
    var hash = 0;
    if (string.length == 0) return hash;
    for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

function validate() {
    var has_service_type = ($('#service-type').val().length > 0);
    var has_date = ($('#date-attended').val().length > 0);
    var has_time = ($('#time-attended').val().length > 0);
    var has_subgroup = ($('#subgroup').val().length > 0);
    if (has_service_type && has_date && has_time && has_subgroup) {
        var d = new Date($('#date-attended').val());
        var current_year = 2022;
        if (d.getFullYear() < current_year) {
            alert('Please enter the correct date');
            return false;
        }
        return true;
    }
    alert('Please complete the information in the form.');
    return false;
}

const saveAttendanceRecords = function() {
    if (!validate()) {
        return;
    }
    disableForm();
    const MACRO_SCRIPT_ID = 'AKfycbyJ9Ek72GDid-b1JUvCf-jGSqdJwQ_ZQnyQFcRcNWTUBDG8gmJzsHTBQc44PQ8yJFIv';
    const googleMacroURL = 'https://script.google.com/macros/s/' + MACRO_SCRIPT_ID + '/exec'
    const form = $('form[name=attendance-form]')

    var member_id = $('#miembros').val();
    var church_id = $('#miembros option:selected').data('churchid');
    var service_type = $('#service-type').val();
    var member_fullname = $('#miembros option:selected').text();
    var subgroup_id = $('#subgroup').val();
    var date_attended = $('#date-attended').val();
    var time_attended = $('#time-attended').val();
    var platform = $('#platform').val();
    var youth = $('#miembros option:selected').data('youth');

    var data = new FormData();
    data.append('id', member_id);
    data.append('church_id', church_id);
    data.append('service_type', service_type);
    data.append('fullname', member_fullname);
    data.append('subgroup', subgroup_id);
    data.append('date_attended', date_attended);
    data.append('time_attended', time_attended);
    data.append('platform', platform);
    data.append('youth', youth);

    fetch(googleMacroURL, {
        method: 'POST',
        body: data
    })
    .then(response => response.json())
    .then(data => {
        successfulAttendanceRecord();
    })
    .catch(error => function() {
        unsuccessfulAttendanceRecord();
    });
}

function disableForm() {
    $('#submit-attendance-button').text('Saving... please wait ...')
    $('#submit-attendance-button').attr('disabled', true);
    $('form input').attr('disabled', true);
    $('form select').attr('disabled', true);
}

function successfulAttendanceRecord() {
    $('.container').fadeOut();
    var template = $('#successful-attendance').html();
    $("#save-attendance-result").html(template);
}

function unsuccessfulAttendanceRecord() {
    $('.container').fadeOut();
    var template = $('#unsuccessful-attendance').html();
    $("#save-attendance-result").html(template);
}

function haveInputs() {
    var has_service_type = ($('#service-type option:selected').val().length > 0);
    var has_date = ($('#date-attended').val().length > 0);
    var has_time = ($('#time-attended option:selected').val().length > 0);
    var has_subgroup = ($('#subgroup option:selected').val().length > 0);
    if (has_subgroup) {
        $('#miembros').attr('disabled', false);
    } else {
        $('#miembros').attr('disabled', true);
    }
    if (has_service_type && has_date && has_time && has_subgroup) {
        $('#submit-attendance-button').attr('disabled', false);
    } else {
        $('#submit-attendance-button').attr('disabled', true);
    }
}

function sortMembers(subgroup_id) {

    var options = $('#miembros option[data-subgroup=' + subgroup_id + ']');
    options.sort(function(a,b) {
        if(a.text.toUpperCase() > b.text.toUpperCase()) {
            return 1;
        } else if(a.text.toUpperCase() < b.text.toUpperCase()) {
            return -1;
        } else {
            return 0;
        }
    });
    $('#miembros').empty().append(options);
}

function setCurrentDate() {
    var d = new Date();
    var dString;
    d.setDate(d.getDate());
    dString = d.getFullYear() + '-'
        + ('0' + (d.getMonth()+1)).slice(-2) + '-'
        + ('0' + d.getDate()).slice(-2);
    $('#date-attended').val(dString);
}

function autoSelectTime(service_type) {
    // Reset
    $('#time-attended option:selected').attr('selected', false);

    // Set
    switch (service_type) {
        case "Prayer Meeting": {
            $('#time-attended option:contains("4:30 AM")').attr('selected', true);
            $('#platform option:selected').attr('selected', false);
            $('#platform option:contains("Zoom")').attr('selected', true);
            break;
        }
        case "Worship Service": {
            $('#time-attended option:contains("4:30 AM")').attr('selected', true);
            $('#platform option:selected').attr('selected', false);
            $('#platform option:contains("Zoom")').attr('selected', true);
            break;
        }
        case "Thanksgiving": {
            $('#time-attended option:contains("5:00 PM")').attr('selected', true);
            $('#platform option:selected').attr('selected', false);
            $('#platform option:contains("Zoom")').attr('selected', true);
            break;
        }
        case "Mass Indoctrination": {
            $('#time-attended option:contains("7:00 PM")').attr('selected', true);
            $('#platform option:selected').attr('selected', false);
            $('#platform option:contains("YouTube")').attr('selected', true);
            break;
        }
        case "Bible Exposition": {
            $('#time-attended option:contains("7:00 PM")').attr('selected', true);
            $('#platform option:selected').attr('selected', false);
            $('#platform option:contains("YouTube")').attr('selected', true);
            break;
        }
        case "Bible Study": {
            $('#time-attended option:contains("7:00 PM")').attr('selected', true);
            $('#platform option:selected').attr('selected', false);
            $('#platform option:contains("YouTube")').attr('selected', true);
            break;
        }
        case "Serbisyong Kapatiran": {
            $('#time-attended option:contains("9:30 PM")').attr('selected', true);
            $('#platform option:selected').attr('selected', false);
            $('#platform option:contains("MCGI TV")').attr('selected', true);
            break;
        }
        case "Global Prayer": {
            $('#time-attended option:contains("9:30 PM")').attr('selected', true);
            $('#platform option:selected').attr('selected', false);
            $('#platform option:contains("YouTube")').attr('selected', true);
            break;
        }
        case "MCGI Cares Program": {
            $('#time-attended option:contains("7:00 PM")').attr('selected', true);
            $('#platform option:selected').attr('selected', false);
            $('#platform option:contains("MCGI TV")').attr('selected', true);
            break;
        }
        default: $('#time-attended option:contains("- Select Time Attended -")').attr('selected', true); break;
    }
    haveInputs();
}

loadMiembros();
setCurrentDate();

$('#subgroup').on('change', function() {
    var selected_subgroup = $(this).val();
    loadSubgroupMembers(selected_subgroup);
    sortMembers(selected_subgroup);
    haveInputs();
});

$('#service-type, #date-attended, #time-attended, #miembros').on('change', haveInputs);

$('#service-type').on('change', function() {
    var service_type = $(this).val();
    autoSelectTime(service_type);
});

$("#showHide").click(function () {
			if ($("#formpassword").attr("type") == "password") {
				$("#formpassword").attr("type", "text");
				$("#showHide").text("Hide");

			} else {
				$("#formpassword").attr("type", "password");
				$("#showHide").text("Show");
			}
});
$("#formRememberMe").on("click", function(event){
			if(this.checked){
				var data = $("#formpassword");
				var res = h(data.val());
				if(res === x){
					window.localStorage.setItem("g8aform", data.val());
					window.localStorage.setItem("g8aformValid", true);
				}			
			}else {
				$(this).prop('checked', false);
				$("#formpassword").val("");
				window.localStorage.setItem("g8aform", "");
				window.localStorage.setItem("g8aformValid", false);
			}
});	
var sessStore=window.localStorage.getItem("g8aform");
var sessStoreValid=window.localStorage.getItem("g8aformValid");
if(sessStore && h(sessStore) === x && sessStoreValid){
	$("#formRememberMe").prop('checked', true);
	$("#formpassword").val(sessStore);
}			

