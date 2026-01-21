function openWindowWithPost() {
    // window.open('', 'TheWindow');
    document.getElementById('TheForm').submit();

    
    //var fileNumber = "0000343014";
    // document.getElementById("<%=Username.ClientID%>").value = "hisuser";
    // document.getElementById("<%=Password.ClientID%>").value = "hisuser";
    // document.getElementById("<%=PatientID.ClientID%>").value = fileNumber;           
    // document.getElementById("<%=form1.ClientID%>").action = "http://172.16.17.96/Launch_Viewer.asp";
    // document.getElementById("<%=form1.ClientID%>").target = "LaunchViewerAll";
    // var popup = window.open('', false, 'menubar=no,toolbar=no,dependent=yes');
    // if (window.focus) { popup.focus(); }
    // document.getElementById("<%=form1.ClientID%>").submit();
    // return false;

}
function openPACS(testoderitemid, hospitalId, ssn) {
    // var pacsUrl = "http://172.16.17.96/Launch_Viewer.asp";
    // if(hospitalId == '3') {
    //   pacsUrl = "http://172.18.17.128/Launch_Viewer.asp";
    // }
    var pacsUrl = "https://pacs-app-sw/Launch_Viewer.asp";
    if(hospitalId == '3') {
      pacsUrl = "https://pacs-app-nz/Launch_Viewer.asp";
    }
    var form = document.createElement("form");
    form.target = "LaunchViewerAll";
    form.method = "POST";
    form.action = pacsUrl;
    var params = {
      "Username": "hisuser",
      "Password": "hisuser",
      "AccessionNumber": testoderitemid
    };
    for (var i in params) {
        if (params.hasOwnProperty(i)) {
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = i;
          input.value = params[i];
          form.appendChild(input);
        }
    }

    document.body.appendChild(form);
    form.submit();
    //window.open('', false, 'menubar=no,toolbar=no,dependent=yes');
    }


  // function showHideDiv(ele) {
  //     var srcElement = document.getElementById(ele);
  //     if (srcElement != null) {
  //         if (srcElement.style.display == "block") {
  //             srcElement.style.display = 'none';
  //         }
  //         else {
  //             srcElement.style.display = 'block';
  //         }
  //         return false;
  //     }
  // }
  function maintoggle() {
    var x = document.getElementById("divDetails");
    // var y = document.getElementById("main_link");
    if (x.style.display === "none") {
      x.style.display = "block";
      // y.classList.add("active");
    } else {
      x.style.display = "none";
      // y.classList.remove("active");
    }
  }
  function toggle1() {
    var x = document.getElementById("toggle1");
    var y = document.getElementById("caret");
    if (x.style.display === "none") {
      x.style.display = "block";
      y.classList.add("caret-down");
    } else {
      x.style.display = "none";
      y.classList.remove("caret-down");
    }
  }
  function toggle2() {
    var x = document.getElementById("toggle2");
    var y = document.getElementById("caret2");
    if (x.style.display === "none") {
      x.style.display = "block";
      y.classList.add("caret-down");
    } else {
      x.style.display = "none";
      y.classList.remove("caret-down");
    }
  }
  function toggle3() {
    var x = document.getElementById("toggle3");
    var y = document.getElementById("caret3");
    if (x.style.display === "none") {
      x.style.display = "block";
      y.classList.add("caret-down");
    } else {
      x.style.display = "none";
      y.classList.remove("caret-down");
    }
  }
  function toggle4() {
    var x = document.getElementById("toggle4");
    var y = document.getElementById("caret4");
    if (x.style.display === "none") {
      x.style.display = "block";
      y.classList.add("caret-down");
    } else {
      x.style.display = "none";
      y.classList.remove("caret-down");
    }
  }
  function toggle5() {
    var x = document.getElementById("toggle5");
    var y = document.getElementById("caret5");
    if (x.style.display === "none") {
      x.style.display = "block";
      y.classList.add("caret-down");
    } else {
      x.style.display = "none";
      y.classList.remove("caret-down");
    }
  }
  function toggle6() {
    var x = document.getElementById("toggle6");
    var y = document.getElementById("caret6");
    if (x.style.display === "none") {
      x.style.display = "block";
      y.classList.add("caret-down");
    } else {
      x.style.display = "none";
      y.classList.remove("caret-down");
    }
  }
  function toggle7() {
    var x = document.getElementById("toggle7");
    var y = document.getElementById("caret7");
    if (x.style.display === "none") {
      x.style.display = "block";
      y.classList.add("caret-down");
    } else {
      x.style.display = "none";
      y.classList.remove("caret-down");
    }
  }
  function toggle8() {
    var x = document.getElementById("toggle8");
    var y = document.getElementById("caret8");
    if (x.style.display === "none") {
      x.style.display = "block";
      y.classList.add("caret-down");
    } else {
      x.style.display = "none";
      y.classList.remove("caret-down");
    }
  }
  function toggle_referral(){
    var x = document.getElementById("referral_body");
    var toggleButton = document.getElementById("toggle_btn_referral");
    var toggleHeader = document.getElementById("toggle_header_referral");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");
    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
    }
  }
  function toggle_diagtable(){
    var x = document.getElementById("diag_table_toggle");
    var toggleButton = document.getElementById("toggle_btn");
    var toggleHeader = document.getElementById("toggle_header");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
    }
  }
  function surgery_req(){
    var x = document.getElementById("surgery_req_body");
    var toggleButton = document.getElementById("toggle_btn_surgery_req");
    var toggleHeader = document.getElementById("toggle_header_surgery_req");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
    }
  }
  function dropdownlab(){
    var x = document.getElementById("dropdownlab");
    if(x != null) x.style.display = "block";
  }

  function hideDropdown() {
    var x = document.getElementById("dropdownlab");
    if(x != null)  x.style.display = "none";
  }
  function dropdownlabType(){
    var x = document.getElementById("dropdownlabType");
    if(x != null) x.style.display = "block";
  }

  function hideDropdownType() {
    var x = document.getElementById("dropdownlabType");
    if(x != null)  x.style.display = "none";
  }

  function toggle_approvaltable(){
    var x = document.getElementById("approvaltable_toggle");
    var toggleButton = document.getElementById("approvaltoggle_btn");
    var toggleHeader = document.getElementById("toggle_header");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
    }
  }

  function toggle_medicbg(){
    var x = document.getElementById("medicbg_toggle");
    var toggleButton = document.getElementById("medicbgtoggle_btn");
    var toggleHeader = document.getElementById("medicbgtoggle_header");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
    }
  }

  function toggle_rov(){
    var x = document.getElementById("rov_toggle");
    var toggleButton = document.getElementById("rov_btn");
    var toggleHeader = document.getElementById("rov_header");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
    }
  }

  function toggle_cc(){
    var x = document.getElementById("cc_toggle");
    var toggleButton = document.getElementById("cc_btn");
    var toggleHeader = document.getElementById("cc_header");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
    }
  }

  function toggle_phyExam(){
    var x = document.getElementById("phyExam_toggle");
    var toggleButton = document.getElementById("phyExam_btn");
    var toggleHeader = document.getElementById("phyExam_header");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
    }
  }
  function toggle_med(){
    var x = document.getElementById("med_toggle");
    var toggleButton = document.getElementById("med_btn");
    var toggleHeader = document.getElementById("med_header");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
    }
  }


  function toggle_labpanic(){
    var x = document.getElementById("labpanic_toggle");
    var toggleButton = document.getElementById("labpanictoggle_btn");
    var toggleHeader = document.getElementById("toggle_header");
    var toggleBorder = document.getElementById("toggle_border");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");
      toggleBorder.classList.remove("card-style-1-border");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
      toggleBorder.classList.add("card-style-1-border");
    }
  }
  function toggle_dia_pro(){
    var x = document.getElementById("dia_pro_toggle");
    var toggleButton = document.getElementById("diatoggle_btn");
    var toggleHeader = document.getElementById("toggle_header");
    var toggleBorder = document.getElementById("toggle_border");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");
      toggleBorder.classList.remove("card-style-1-border");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
      toggleBorder.classList.add("card-style-1-border");
    }
  }
  function toggle_pat_int(){
    var x = document.getElementById("pat_int_toggle");
    var toggleButton = document.getElementById("pat_inttoggle_btn");
    var toggleHeader = document.getElementById("toggle_header");
    var toggleBorder = document.getElementById("toggle_border");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");
      toggleBorder.classList.remove("card-style-1-border");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
      toggleBorder.classList.add("card-style-1-border");
    }
  }
  function toggle_phy_exm(){
    var x = document.getElementById("phy_exm_toggle");
    var toggleButton = document.getElementById("phy_exmtoggle_btn");
    var toggleHeader = document.getElementById("toggle_header");
    var toggleBorder = document.getElementById("toggle_border");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");
      toggleBorder.classList.remove("card-style-1-border");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
      toggleBorder.classList.add("card-style-1-border");
    }
  }
  function toggle_anes_inv(){
    var x = document.getElementById("anes_inv_toggle");
    var toggleButton = document.getElementById("anes_invtoggle_btn");
    var toggleHeader = document.getElementById("toggle_header");
    var toggleBorder = document.getElementById("toggle_border");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");
      toggleBorder.classList.remove("card-style-1-border");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
      toggleBorder.classList.add("card-style-1-border");
    }
  }
  function toggle_cons_spe(){
    var x = document.getElementById("cons_spe_toggle");
    var toggleButton = document.getElementById("cons_spetoggle_btn");
    var toggleHeader = document.getElementById("toggle_header");
    var toggleBorder = document.getElementById("toggle_border");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");
      toggleBorder.classList.remove("card-style-1-border");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
      toggleBorder.classList.add("card-style-1-border");
    }
  }
  function toggle_asse_ane(){
    var x = document.getElementById("asse_ane_toggle");
    var toggleButton = document.getElementById("asse_anetoggle_btn");
    var toggleHeader = document.getElementById("toggle_header");
    var toggleBorder = document.getElementById("toggle_border");
    if(x.style.display === "none"){
      x.style.display = "block";
      toggleButton.classList.add("active");
      toggleHeader.classList.remove("headertoggle_bottom_radius");
      toggleBorder.classList.remove("card-style-1-border");

    } else {
      x.style.display="none";
      toggleButton.classList.remove("active");
      toggleHeader.classList.add("headertoggle_bottom_radius");
      toggleBorder.classList.add("card-style-1-border");
    }
  }


  function servicesButton1() {
    var x = document.getElementById("servicesButton_menu");
    if(x.style.display === "none"){
      x.style.display = "block";

    } else {
      x.style.display="none";
    }
  }

  function servicesButton(){
    var x = document.getElementById("servicesButton_menu");
    x.style.display = "block";
  }

  function hideservicesButton() {
    var x = document.getElementById("servicesButton_menu");
    x.style.display = "none";
  }

  function toggleHeader(button, header, toggle) {
    const x = document.getElementById(toggle);
    const toggleButton = document.getElementById(button);
    const toggleHeader = document.getElementById(header);
    if (x.style.display === "none") {
      x.style.setProperty('display', 'block');
      toggleButton?.classList.add("active");
      toggleHeader?.classList.remove("headertoggle_bottom_radius");
      toggleHeader?.parentElement.classList.remove("headertoggle_bottom_radius");
    } else {
      x.style.setProperty('display', 'none', 'important');
      toggleButton?.classList.remove("active");
      toggleHeader?.classList.add("headertoggle_bottom_radius");
      toggleHeader?.parentElement.classList.add("headertoggle_bottom_radius");
    }
  }