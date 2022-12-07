// function addToCart(productId)
// {

//     $.ajax({
//        url:'/add-to-Cart/'+productId,
//        method:'get',
//        success: (response)=>{
//         // alert("ADD TO CART SUCCESSFULLY")
//         swal("ADD TO CART SUCCESSFULLY" )
        
        
//        }
//   })
// }





// function addToCart(productId){
//   const alertText = document.getElementById('alert-text')
//   const alertBox = document.getElementById('alert-box')

//   $.ajax({
//        url:'/add-to-Cart/'+productId,
//       method:'get',
//       success:(response)=>{
         
//           if(response.status){
//               let count=$('#cart-count').html()
//               count=parseInt(count)+1         
//               $('#cart-count').html(count)
//               // e.target.style.margin = "-50px 260px"

//               alertText.innerText = "successfully added to the cart"
//               alertBox.style.opacity = "1"
//               alertBox.style.transform = "scale(.5)"
//               setTimeout(() => {
//                   alertBox.style.transform = "scale(0.25)"
//                   alertBox.style.opacity = "0"
          
//               }, 1000)
//           }
//           else{
            
//               swal("Please login").then(()=>{location.href='/Login'})
          
//           }
//       }
//   })

// }