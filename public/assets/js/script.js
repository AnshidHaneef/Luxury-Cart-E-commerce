


     function addToCart(productId){

    $.ajax({
       url:'/add-to-Cart/'+productId,
       method:'get',
       success: (response)=>{

            
        // alert("ADD TO CART SUCCESSFULLY")
        // swal("ADD TO CART SUCCESSFULLY" ) 
        
        Swal.fire(
            'Congrats!',
            'Added to Cart Successfully!',
            'success'
          )

       }
  })
}


function redirectToHome(){
    // swal("Please login")  
    Swal.fire({
        icon: 'error',
        title: 'Please Login !!',
      }).then(()=>{location.href='/Login'})
}



function userDetails(userId,id){
    
    $.ajax({
        url:'/admin/userDetails?id='+userId,        
        method:'get',
        success:(response)=>{
            console.log(response,"response");

            $('#name'+id).html(response.username)
            $('#email'+id).html(response.email)
        }
    })
}



function setStatus(id){ 
    // let status = $(`#status${id}`).val()
    let status = document.getElementById(`status?${id}`).value
    console.log("iddd",id,status);

                        
                            // if (!status) {
                            
                            //     status = "Waiting for cancel approval"
                            //     $('#status'+id).html(status)
                            // }
                        
    $.ajax({ 
        url:'/admin/set-status',
        data:{
            status:status,
            orderId:id
        },
        method:'post',
        success:(response)=>{ 
         }  
    })
}



