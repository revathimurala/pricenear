import React from 'react'
import {useState,useEffect} from "react"
import { db } from "../../services/firebase"
import { auth } from '../../services/firebase'
import {collection,getDocs,addDoc,query,where,serverTimestamp,doc,deleteDoc} from "firebase/firestore"
const VendorDashboard = () => {
  //for products list -by using list and usestate
  //stores all products from firebase
  const [products,setProducts]=useState([]);
  //for productname
  const [productName,setProductName] = useState("")
  const [message,setMessage]=useState("");
  //for selected product from dropdown in guven options
  const [selectedProduct,setSelectedProduct]=useState("");
  //for prices
  const [price,setPrice]=useState("");
  //for store info by using id of that vendor
  const [storeId,setStoreId]=useState("");
  const [storeName,setStoreName]=useState("");
  const [stores,setStores]=useState([]);
  // for adding store address
  //new features
  const [area,setArea] = useState("")
  const [latitude,setLatitude] = useState("")
  const [longitude,setLongitude] = useState("")
  const [pincode,setPincode] = useState("")

  //to fetch products from database
  const fetchStores = async()=>{
      const user = auth.currentUser
      if(!user) return
      const q = query(
        collection(db,"stores"),
        where("ownerUid","==",user.uid)
      )
      const snapshot = await getDocs(q)
      const list = snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }))
      setStores(list)
      if(list.length > 0){
        setStoreId(list[0].id)
      }
    }
  useEffect(()=>{
    fetchStores()
  },[])
  const addStore = async () => {
    const user = auth.currentUser
    if(!storeName || !area || !pincode){
        alert("Please fill all store details")
        return
      }

      const docRef = await addDoc(collection(db,"stores"),{
        name:storeName,
        area:area,
        pincode:pincode,
        latitude:Number(latitude),
        longitude:Number(longitude),
        ownerUid:user.uid,
        verified:true
      })
      alert("Store Added")
      setStoreName("")
      setArea("")
      setPincode("")
      setLatitude("")
      setLongitude("")

      setStoreId(docRef.id)
      fetchStores();
  }
  const fetchProducts = async()=>{
      const q = query(
        collection(db,"products"),
        where("storeId","==",storeId)
      )
      const snapshot = await getDocs(q)
      const list = snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }))
      setProducts(list)
    }
  useEffect(()=>{
    if(!storeId) return
    fetchProducts()
  },[storeId])
  const addProduct=async()=>{
    if(!storeId){
      alert("Please select a store first")
      return
    }
    if(!productName){
      alert("enter product name")
    return
    }
    const q=query(collection(db,"products"),
        where("name","==",productName.toUpperCase()),
        where("storeId","==",storeId)
    )
      const snapshot = await getDocs(q)
      if(!snapshot.empty){
        alert("product already exist")
        return;
      }
    await addDoc(collection(db,"products"),{
      name:productName.toUpperCase(),
      storeId:storeId
    })
    fetchProducts();
    alert("product added")
    setProductName("")
  }
  const deleteProduct=async(id)=>{
    await deleteDoc(doc(db,"products",id))
    alert("Product Deleted");
    setProducts(products.filter(p=>p.id!==id));
  }
  const addPrice = async()=>{
    if(!selectedProduct || !price){
      alert("select product and price")
      return
    }
    await addDoc(collection(db,"prices"),{
      storeId,
      productId:selectedProduct,
      price:Number(price),
      timestamp:serverTimestamp()
    })
    alert("price added")
    setPrice("")
  }

  return (
    <div style={{maxWidth:"400px",margin:"auto"}}>
      <h1>Vendor Dashboard</h1>
      <h1>Add store</h1>
      <h1>Add Store</h1>

      <input
        placeholder="Store name"
        value={storeName}
        onChange={(e)=>setStoreName(e.target.value)}
      />

      <input
        placeholder="Area"
        value={area}
        onChange={(e)=>setArea(e.target.value)}
      />

      <input
        placeholder="Pincode"
        value={pincode}
        onChange={(e)=>setPincode(e.target.value)}
      />

      <input
        placeholder="Latitude"
        value={latitude}
        onChange={(e)=>setLatitude(e.target.value)}
      />

      <input
        placeholder="Longitude"
        value={longitude}
        onChange={(e)=>setLongitude(e.target.value)}
      />

      <button onClick={addStore}>Add Store</button>
      <hr />
      <br />
      <h3>Add Product</h3>
      

      <input
        placeholder="product name"
        value={productName}
        onChange={(e)=>setProductName(e.target.value)}
      />
      
      <p>Select store before adding product</p>
      <select value={storeId} onChange={(e)=>setStoreId(e.target.value)}>

        <option>Select store</option>
        {stores.map(s=>(
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      
      <button onClick={addProduct}>
        Add Product
      </button>
      <hr />
      <br />
      <h3>Your Products</h3>
      <hr />
      <br />
      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.name+" "+"-"}
            <button onClick={() => deleteProduct(p.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <hr />
      <h3>Add Price</h3>
      <select onChange={(e)=>setSelectedProduct(e.target.value)}>
        <option>Select product</option>
        {products.map(p=>(
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="price"
        value={price}
        onChange={(e)=>setPrice(e.target.value)}
      />
      <button onClick={addPrice}>
        Add Price
      </button>
      {message&&(<p>{message}</p>)}
    </div>

  )
}

export default VendorDashboard