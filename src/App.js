import './App.css';
import { useEffect, useState, useCallback } from 'react';
import ProductList from './components/ProductList';
import CartList from './components/CartList';
import Loading from './components/Loading';
import Header from './components/header/Header';
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import ResultSearch from './components/ResultSearch';
import NoResult from './components/NoResult';

function App() {
  const [products, setProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]); 
  const [inputBuscarItem, setInputBuscarItem] = useState(''); 
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [sideBarIsOpen, setSideBarIsOpen] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectCategoria, setSelectCategoria] = useState('');
  const [sort, setSort] = useState('asc');
  const [typeListProducts, setTypeListProducts] = useState('productContainerBlock');
  const [showInfoHamburguer, setShowInfoHamburguer] = useState('');
  const [countCart, setCountCart] = useState(0);

  const fetchProducts = useCallback(() => {
    setRemoveLoading(false);
    const url = selectCategoria 
      ? `https://fakestoreapi.com/products/category/${selectCategoria}?sort=${sort}`
      : `https://fakestoreapi.com/products?sort=${sort}`;

    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        setRemoveLoading(true);
      })
      .catch((error) => console.log(error));
  }, [selectCategoria, sort]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts]);

  const fetchCategories = () => {
    fetch(`https://fakestoreapi.com/products/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => console.log(error));
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) => 
          item.id === product.id && item.quantity < 25 ?{ ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    setSideBarIsOpen(true);
  };

  const updateCartItemQuantity = (id, newQuantity) => {
    setCart((prevCart) => 
      prevCart.map((item) => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ).filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (id) => {
    setCart((prevCart) => 
      prevCart.map((item) => 
        item.id === id ? { ...item, quantity: 0 } : item
      ).filter((item) => item.quantity > 0)
    );
  };

  useEffect(() => {
    let count = cart.reduce((total, item) => total + item.quantity, 0);
    setCountCart(count);
    
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const buscarItem = (valor) => {
    setInputBuscarItem(valor); 
  };

  useEffect(() => {
    if (inputBuscarItem.trim()) { 
      const filtered = products.filter((item) => {
        if (item.title) {
          return item.title.toLowerCase().includes(inputBuscarItem.toLowerCase());
        }
        return false;
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products); 
    }
  }, [inputBuscarItem, products]);

  const toggleSidebar = () => {
    setSideBarIsOpen(!sideBarIsOpen);
  };

  const handleSelectChangeCategories = (value, index) => {
    setSelectCategoria(index > 0 ? value : '');
  };

  const handleSelectChangeOrdenar = (value) => {
    setSort(value);
  };

  const order = (value) => {
    setTypeListProducts(value);
  };

  const clickShowInfoHamburguer = (value) => {
    setShowInfoHamburguer(value === '' ? 'action' : '');
  };

  useEffect(() => {
    if (sideBarIsOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [sideBarIsOpen]);
  return (
    <div className="App">
      <Navbar
        acaoButtonCart={toggleSidebar}
        clickShowInfoHamburguer={clickShowInfoHamburguer}
        showInfoHamburguer={showInfoHamburguer}
        buscarItem={buscarItem}
        valorInputBuscarItem={inputBuscarItem}
        countCart={countCart}
      />
      {inputBuscarItem !== '' 
      ? <ResultSearch inputBuscarItem={inputBuscarItem} /> : ''}
  
      <Header
        order={order}
        typeListProducts={typeListProducts}
        categories={categories}
        handleSelectChangeOrdenar={handleSelectChangeOrdenar}
        handleSelectChangeCategories={handleSelectChangeCategories}
      />
      
      <main>
        {removeLoading ? (
          <ProductList typeListProducts={typeListProducts} products={filteredProducts} addToCart={addToCart} />
        ) : (
          <div>
            <Loading />
            <NoResult />
          </div>
        )}
      </main>
  
      <CartList 
        toggleSidebar={toggleSidebar} 
        cart={cart} 
        isOpen={sideBarIsOpen} 
        subtotal={calculateSubtotal()}
        updateCartItemQuantity={updateCartItemQuantity}
        removeCartItem={removeCartItem}
      />
      
      <Footer />
    </div>
  );
  
}

export default App;
