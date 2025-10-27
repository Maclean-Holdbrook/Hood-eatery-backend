# Extras and Portions System - Implementation Guide

## Overview
The Hood Eatery application now supports admin-managed extras (add-ons) and portions for menu items. This allows flexibility in menu management without hardcoding values.

## Database Schema

### Menu Items Table Changes
Three new columns have been added to the `menu_items` table:

```sql
- original_price: DECIMAL(10, 2) - Original price for displaying discounts
- extras: JSONB - Array of extra items/add-ons
- portions: JSONB - Array of portion sizes
```

### Data Format

#### Extras Format
```json
[
  {
    "id": 1,
    "name": "egg",
    "price": 2.50,
    "originalPrice": 5.00
  },
  {
    "id": 2,
    "name": "chicken",
    "price": 7.50,
    "originalPrice": 15.00
  }
]
```

#### Portions Format
```json
[
  {
    "id": "individual",
    "name": "Individual",
    "price": 0
  },
  {
    "id": "family",
    "name": "Family",
    "price": 25.00,
    "originalPrice": 50.00
  }
]
```

## Backend API

### Menu Item Create/Update
The backend now accepts `extras` and `portions` fields:

```javascript
POST /api/menu/items
PUT /api/menu/items/:id

FormData fields:
- categoryId
- name
- description
- price
- originalPrice (optional)
- isAvailable
- isFeatured
- image (file)
- extras (JSON string)
- portions (JSON string)
```

### Response Format
Menu items now include extras and portions:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jollof Rice",
    "price": 20.00,
    "original_price": 40.00,
    "extras": [
      { "id": 1, "name": "egg", "price": 2.50 }
    ],
    "portions": [
      { "id": "individual", "name": "Individual", "price": 0 },
      { "id": "family", "name": "Family", "price": 25.00 }
    ]
  }
}
```

## Admin UI Features

### Managing Extras
1. Navigate to Admin Menu page
2. Click "Add New Item" or "Edit" on existing item
3. Scroll to "Extras/Add-ons" section
4. Fill in:
   - Extra name (e.g., "egg", "chicken", "fish")
   - Price
   - Original Price (optional, for showing discounts)
5. Click "Add" to add the extra
6. Remove extras by clicking the × button on each tag

### Managing Portions
1. In the same modal, scroll to "Portion Sizes" section
2. Fill in:
   - Portion name (e.g., "Individual", "Family")
   - Additional price (0 for base portion)
   - Original Price (optional)
3. Click "Add" to add the portion
4. Remove portions by clicking the × button on each tag

### Example Use Cases

#### Case 1: Rice with Multiple Extras
- **Item**: Jollof Rice
- **Base Price**: GHC 20.00
- **Extras**:
  - Egg: GHC 2.50
  - Chicken: GHC 7.50
  - Fish: GHC 6.00
  - Coleslaw: GHC 5.00
- **Portions**:
  - Individual: +GHC 0
  - Family: +GHC 25.00

#### Case 2: Pizza with Sizes
- **Item**: Margherita Pizza
- **Base Price**: GHC 30.00
- **Extras**:
  - Extra Cheese: GHC 5.00
  - Pepperoni: GHC 8.00
- **Portions**:
  - Small (8"): +GHC 0
  - Medium (12"): +GHC 15.00
  - Large (16"): +GHC 30.00

## Frontend Integration

### Food Detail Modal
When customers click on a menu item, they see:
1. Item image and description
2. Portion size selection (if available)
3. Extras/add-ons with checkboxes (if available)
4. Quantity selector
5. Special instructions text field
6. Total price calculation

### Price Calculation
```javascript
Total = (Base Price + Portion Price + Sum of Selected Extras) × Quantity
```

### Example Calculation
- Jollof Rice: GHC 20.00
- Family Portion: +GHC 25.00
- Egg: +GHC 2.50
- Chicken: +GHC 7.50
- Quantity: 2
- **Total**: (20 + 25 + 2.50 + 7.50) × 2 = **GHC 110.00**

## Migration

### Running the Migration
The database has already been migrated. If you need to run it again on a different environment:

```bash
cd "Hood Eatery Backend"
node scripts/addExtrasPortions.js
```

### Checking Migration Status
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'menu_items'
AND column_name IN ('extras', 'portions', 'original_price');
```

## Best Practices

### For Admins
1. **Keep extras organized**: Use consistent naming (lowercase, descriptive)
2. **Set reasonable prices**: Consider profit margins
3. **Use original prices**: Show value to customers
4. **Test ordering**: Place test orders to ensure correct calculations
5. **Update regularly**: Keep menu current and remove unavailable items

### For Developers
1. **Validate data**: Always check if extras/portions exist before displaying
2. **Handle empty arrays**: UI should gracefully handle items without extras/portions
3. **Parse carefully**: Always use try-catch when parsing JSON from FormData
4. **Keep IDs unique**: Use timestamps or UUIDs for extra IDs
5. **Test edge cases**: Test with no extras, no portions, and both

## Troubleshooting

### Issue: Extras not showing in modal
**Solution**: Check if the menu item was created after migration. Old items need to be updated to include extras.

### Issue: Prices not calculating correctly
**Solution**: Verify that extras and portions have numeric price values, not strings.

### Issue: Form data not submitting
**Solution**: Ensure extras and portions are JSON stringified before sending to backend.

### Issue: Database error on update
**Solution**: Check that the database columns exist. Run migration script if needed.

## Support

For issues or questions:
1. Check the browser console for errors
2. Check the backend logs
3. Verify database schema
4. Review API request/response in Network tab

---

**Last Updated**: 2025-10-27
**Version**: 1.0
**Status**: Production Ready ✅
