import React from 'react'
import {useState,useEffect} from "react"
import {collection,getDocs} from "firebase/firestore"
import { db } from "../../services/firebase"

// a div with name searched,cost,distance,avaliable,analysis

const Search = () => {
  //fro getting all products
  const [products,setProducts]=useState([]);
  // for getting all products based on search content
  const [filtered,setFiltered]=useState([]);
  //that content is given from this by user
  const [search,setSearch]=useState("");
  //to add a store 
  const [stores,setStores] = useState([])
  //to add price
  const [prices,setPrices]=useState([]);
  //to get user location
  const [userLocation,setUserLocation]=useState(null);
  // when we reload we need all products details, stores, prices

  useEffect (()=>{
    fetchProducts()
    fetchStores()
    fetchPrices();
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position)=>{
        setUserLocation({
          lat:position.coords.latitude,
          lng:position.coords.longitude
        })
      })
    }
  },[])
  //to calc distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2-lat1) * Math.PI/180
    const dLon = (lon2-lon1) * Math.PI/180
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +Math.cos(lat1*Math.PI/180) *Math.cos(lat2*Math.PI/180) *Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return (R * c).toFixed(2)
  }

  // to get all prices from db
  const fetchPrices=async ()=>{
      const snapshot=await getDocs(collection(db,"prices"))
      const list = snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }))
      setPrices(list)
  }
  //to get all products from db
  const fetchProducts=async()=>{
    const snapshot=await getDocs(collection(db,"products"))
    const list=snapshot.docs.map(doc=>({
      id:doc.id,
      ...doc.data()
    }))
    setProducts(list);
  }
  //to get all stores from db
  const fetchStores = async () => {
    const snapshot = await getDocs(collection(db,"stores"))
    const list = snapshot.docs.map(doc=>({
      id:doc.id,
      ...doc.data()
    }))
    setStores(list)
  }
  // when user click on search button we filter produts based on that
  const handleSearch=(e)=>{
    const value=e.target.value;
    setSearch(value);
    const result=products.filter(p=>(
      p.name.toLowerCase().includes(value.toLowerCase()))
    )
    setFiltered(result);
  }
  return (
    <div>
        <h1>Search</h1>
        <input 
          type="text" 
          placeholder="searchProducts ...."
          value={search}
          onChange={handleSearch}
        />
        <div>
          {filtered.map(p=>{
            const store = stores.find(s=>s.id===p.storeId)
            const priceObj = prices.find(
              pr => pr.productId === p.id && pr.storeId === p.storeId
            )
            const productPrices = prices.filter(pr => pr.productId === p.id)
            const cheapest = Math.min(...productPrices.map(pr => pr.price))
            let distance = "Unknown"
            if(userLocation && store?.latitude){
              distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                store.latitude,
                store.longitude
              ) + " km"
            }
            return (
              <div key={p.id} style={{border:"1px solid #ccc",margin:"10px",padding:"10px"}}>
                <h3>{p.name}</h3>
                <p>Store: {store?.name}</p>
                <p>Distance: {distance}</p>
                <p
                  style={{
                    color: priceObj?.price === cheapest ? "green" : "black",
                    fontWeight: priceObj?.price === cheapest ? "bold" : "normal"
                  }}
                >
                  Price: {priceObj?.price || "N/A"} Rs
                </p>
              </div>
            )
          })}
          {filtered.length==0&&<p>No products found</p>}
        </div>
    </div>
  )
}

export default Search