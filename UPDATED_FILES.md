# Updated Files - Copy & Paste Guide

The files below have been updated to support `originalPrice`. Copy and paste the code sections as indicated.

---

## 1. menuController.js

### Update createMenuItem function (line ~150)

Find this line:
```js
const { categoryId, name, description, price, isAvailable, isFeatured } = req.body;
```

**Replace with:**
```js
const { categoryId, name, description, price, originalPrice, isAvailable, isFeatured } = req.body;
```

Find this SQL:
```js
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_featured)
VALUES (
  ${categoryId},
  ${name},
  ${description},
  ${price},
  ${imageUrl},
  ${isAvailable !== undefined ? isAvailable : true},
  ${isFeatured || false}
)
```

**Replace with:**
```js
INSERT INTO menu_items (category_id, name, description, price, original_price, image_url, is_available, is_featured)
VALUES (
  ${categoryId},
  ${name},
  ${description},
  ${price},
  ${originalPrice || null},
  ${imageUrl},
  ${isAvailable !== undefined ? isAvailable : true},
  ${isFeatured || false}
)
```

---

### Update updateMenuItem function (line ~184)

Find this line:
```js
const { categoryId, name, description, price, isAvailable, isFeatured } = req.body;
```

**Replace with:**
```js
const { categoryId, name, description, price, originalPrice, isAvailable, isFeatured } = req.body;
```

Find this SQL:
```js
UPDATE menu_items
SET
  category_id = ${categoryId},
  name = ${name},
  description = ${description},
  price = ${price},
  image_url = ${imageUrl},
  is_available = ${isAvailable},
  is_featured = ${isFeatured},
  updated_at = NOW()
WHERE id = ${id}
```

**Replace with:**
```js
UPDATE menu_items
SET
  category_id = ${categoryId},
  name = ${name},
  description = ${description},
  price = ${price},
  original_price = ${originalPrice || null},
  image_url = ${imageUrl},
  is_available = ${isAvailable},
  is_featured = ${isFeatured},
  updated_at = NOW()
WHERE id = ${id}
```

---

## 2. AdminMenu.jsx (Frontend)

### Update formData state (line ~13)

Find:
```jsx
const [formData, setFormData] = useState({
  categoryId: '',
  name: '',
  description: '',
  price: '',
  isAvailable: true,
  isFeatured: false,
  image: null
});
```

**Replace with:**
```jsx
const [formData, setFormData] = useState({
  categoryId: '',
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  isAvailable: true,
  isFeatured: false,
  image: null
});
```

---

### Update handleSubmit (line ~70)

Find:
```jsx
const data = new FormData();
data.append('categoryId', formData.categoryId);
data.append('name', formData.name);
data.append('description', formData.description);
data.append('price', formData.price);
data.append('isAvailable', formData.isAvailable);
data.append('isFeatured', formData.isFeatured);
```

**Replace with:**
```jsx
const data = new FormData();
data.append('categoryId', formData.categoryId);
data.append('name', formData.name);
data.append('description', formData.description);
data.append('price', formData.price);
if (formData.originalPrice) {
  data.append('originalPrice', formData.originalPrice);
}
data.append('isAvailable', formData.isAvailable);
data.append('isFeatured', formData.isFeatured);
```

---

### Update handleEdit (line ~99)

Find:
```jsx
const handleEdit = (item) => {
  setEditingItem(item);
  setFormData({
    categoryId: item.category_id,
    name: item.name,
    description: item.description,
    price: item.price,
    isAvailable: item.is_available,
    isFeatured: item.is_featured,
    image: null
  });
  setShowModal(true);
};
```

**Replace with:**
```jsx
const handleEdit = (item) => {
  setEditingItem(item);
  setFormData({
    categoryId: item.category_id,
    name: item.name,
    description: item.description,
    price: item.price,
    originalPrice: item.original_price || '',
    isAvailable: item.is_available,
    isFeatured: item.is_featured,
    image: null
  });
  setShowModal(true);
};
```

---

### Update resetForm (line ~127)

Find:
```jsx
const resetForm = () => {
  setFormData({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    isAvailable: true,
    isFeatured: false,
    image: null
  });
};
```

**Replace with:**
```jsx
const resetForm = () => {
  setFormData({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    isAvailable: true,
    isFeatured: false,
    image: null
  });
};
```

---

### Change $ to GHC (line ~175)

Find:
```jsx
<p className="price">${parseFloat(item.price).toFixed(2)}</p>
```

**Replace with:**
```jsx
<p className="price">GHC{parseFloat(item.price).toFixed(2)}</p>
```

---

## 3. Database Migration

Run this SQL in your Neon database console:

```sql
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);
```

---

## 4. Replace orderController.js

**IMPORTANT:** Replace the ENTIRE content of `orderController.js` with the content from:

```
src/controllers/orderController_NEON.js
```

This is necessary because the current orderController.js uses Supabase syntax which doesn't work with Neon PostgreSQL.

---

## Summary

After making these changes:
1. ✅ originalPrice field supported in backend
2. ✅ originalPrice field in admin form
3. ✅ Database has original_price column
4. ✅ Order controller uses Neon PostgreSQL

Your menu will display with strikethrough pricing when originalPrice is set!
