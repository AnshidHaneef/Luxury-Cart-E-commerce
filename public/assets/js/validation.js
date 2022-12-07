 
$(document).ready(function () {
    jQuery.validator.addMethod(
      "lettersonly",
      function (value, element) {
        return this.optional(element) || /^[a-z,A-Z ]+$/.test(value);
      },
      "Letters only please"
    );
    jQuery.validator.addMethod(
      "minlength5",
      function (value, element) {
        return this.optional(element) || (value.trim().length >= 5);
      },  
      "Minimum 5 characters without space"
    );
    $("#submit-form").validate({
      rules: {
        username: {
             lettersonly:true,
       
          required: true,
        },


        email: {
          required: true,
          email: true,

        username: {
          required: true,
          email: true,

        },
        phone: {
          required: true,
          number: true,
          minlength: 10,
          maxlength: 10,
        },
        password: {
          noSpace:true,
          required: true,
          minlength: 5,
          maxlength: 15,
        },
        con_Password: {
          noSpace:true,
          equalTo: "#password",
          minlength5: true,
          required: true,
          minlength: 5,
          maxlength: 15,
        },
      },
      messages: {
        user: {
          minlength: "Please Enter Your Full Name",
        },
        email: {
          email: "Please enter a valid Email id",
        },
        password: {
          minlength: "Please enter a password more than 5 characters",
          maxlength: "Please enter a password less than 15 characters",
        },
        phone: "Enter valid phone number ",
        con_Password: "Enter same password again",
      },
     },
    });
   
  });


$(document).ready(function () {
    jQuery.validator.addMethod(
      "lettersonly",
      function (value, element) {
        return this.optional(element) || /^[a-z,A-Z ]+$/.test(value);
      },
      "Letters only please"
    );

    jQuery.validator.addMethod(
      "minlength5",
      function (value, element) {
        return this.optional(element) || (value.trim().length >= 5);
      },  
      "Minimum 5 characters without space"
    );
    
    $("#add-address").validate({
      rules: {
        
        address: {
          required: true,
          minlength:10,
          maxlength:50,
          // lettersonly:true

        },

       
        city: {
          required: true,
          minlength: 4,
          maxlength: 10,
          lettersonly:true

        },
        state: {
          required: true,
          minlength: 4,
          maxlength: 10,
          lettersonly:true

        },
        country: {
          required: true,
          minlength: 4,
          maxlength: 10,
          lettersonly:true

        },
        area: {
          required: true,
          minlength: 5,
          maxlength: 15,
          lettersonly:true
        },
        pin: {
          required: true,
          minlength: 4,
          maxlength: 6,
          number:true
        },
      
      messages: {
       address: {
        maxlength:"its too long ",
          minlength: "Please Enter Your Full Adress",
        },
        city: {
          minlength: "Please enter valid a detail",
        },
        country: {
          minlength: "Please enter valid a detail",
        },
        pin: {
          minlength: "your pin is too short",
        },
      },
     },
    });
  });




  $(document).ready(function(){
    jQuery.validator.addMethod(
      "minlength5",
      function (value, element) {
        return this.optional(element) || (value.trim().length >= 5);
      },  
      "Make this coupon name Strong !"
    );
    $('#add-coupon').validate({
      rules:{
        couponName:{
          required:true,
          minlength5:true,

        },
        offer:{
            number:true
        },
        messages:{
          minlength5:'Make this coupon name Strong !'
        }
      }
    })

  })