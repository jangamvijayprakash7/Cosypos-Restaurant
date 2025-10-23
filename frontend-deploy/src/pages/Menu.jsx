import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { FiEdit3, FiTrash2, FiPlus, FiX } from 'react-icons/fi'
import { useUser } from './UserContext'
import { getMenuItems, updateMenuItem, createMenuItem, deleteMenuItem, getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage, uploadMenuItemImage } from '../utils/api'
import Layout from './Layout.jsx'
import Categories from './Categories.jsx'
import Toast from '../components/Toast.jsx'

const colors = {
  bg: '#111315',
  panel: '#292C2D',
  text: '#FFFFFF',
  accent: '#FAC1D9',
  muted: '#777979',
  line: '#3D4142',
  inputBg: '#3D4142',
}

// Helper functions
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-food.jpg'
    if (imagePath.startsWith('http')) return imagePath
    if (imagePath.startsWith('/uploads/')) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      return `${baseUrl}${imagePath}`
    }
    if (imagePath.startsWith('/')) return imagePath
    return imagePath
  }

const handleImageError = (e) => {
  if (!e.target.src.includes('placeholder-food.jpg')) {
    e.target.src = '/placeholder-food.jpg'
  }
}

export default function Menu() {
  const navigate = useNavigate()
  const { user } = useUser()
  
  // Check if user has menu editing permission
  const canEditMenu = () => {
    if (!user) return false
    
    // USER role (customers) should never have edit access
    if (user.role === 'USER') return false
    
    // ADMIN and STAFF have full edit access
    if (user.role === 'ADMIN') return true
    if (user.role === 'STAFF') return true
    
    // For other roles, check permissions
    try {
      const permissions = typeof user.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user.permissions || {}
      return permissions.menu === true
    } catch {
      return false
    }
  }
  
  // Core data state
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataVersion, setDataVersion] = useState(0)
  
  // UI state
  const [activeCategory, setActiveCategory] = useState('all')
  
  // Modal states
  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false)
  const [isEditMenuItemModalOpen, setIsEditMenuItemModalOpen] = useState(false)
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false)
  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false)
  
  // Form states
  const [editingItem, setEditingItem] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    availability: 'In Stock'
  })
  const [categoryForm, setCategoryForm] = useState({ name: '', image: null })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null, title: '' })

  // Fetch data from PostgreSQL
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching from PostgreSQL...')
      
      const [itemsResponse, categoriesData] = await Promise.all([
        getMenuItems({ page: 1, limit: 100 }), // Use pagination for faster loading
        getCategories()
      ])
      
      // Handle both paginated and non-paginated response
      const itemsData = itemsResponse.items || itemsResponse
      
      console.log('📊 Received:', itemsData.length, 'items,', categoriesData.length, 'categories')
      
      // Transform menu items from PostgreSQL
      const transformedItems = itemsData.map(item => {
        const availability = item.available === true ? 'In Stock' : 'Out of Stock'
        console.log(`📦 Item: ${item.name}, available: ${item.available}, availability: ${availability}`)
        
        return {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.priceCents ? (item.priceCents / 100).toFixed(2) : '0.00',
          category: item.category?.name || 'Other',
          categoryId: item.categoryId,
          stock: item.stock || 0,
          availability: availability,
          image: item.image || '/placeholder-food.jpg',
          active: item.available
        }
      })
      
      // Add "All" category
      const allCategories = [
        {
        id: 'all',
        name: 'All Items',
          count: transformedItems.length
        },
        ...categoriesData.map(cat => ({
          ...cat,
          count: transformedItems.filter(item => item.categoryId === cat.id).length
        }))
      ]
      
      setMenuItems(transformedItems)
      setCategories(allCategories)
      setDataVersion(prev => prev + 1)
      
      console.log('✅ Data loaded successfully')
    } catch (error) {
      console.error('❌ Error fetching data:', error)
      showToast('Failed to load data: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [])
    
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Toast and Dialog helpers
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({ show: true, title, message, onConfirm })
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, message: '', onConfirm: null, title: '' })
  }

  // Menu Item CRUD
  const handleAddMenuItem = () => {
    setMenuItemForm({
    name: '',
    description: '',
    price: '',
      category: categories.length > 1 ? categories[1].id : '',
      stock: '0',
    availability: 'In Stock'
  })
    setImageFile(null)
    setImagePreview(null)
    setEditingItem(null)
    setIsAddMenuItemModalOpen(true)
  }

  const handleEditMenuItem = (item) => {
    setEditingItem(item)
    setMenuItemForm({
        name: item.name,
        description: item.description,
      price: item.price,
      category: item.categoryId || '',
      stock: item.stock.toString(),
        availability: item.availability
      })
    setImageFile(null)
    setImagePreview(getImageUrl(item.image))
      setIsEditMenuItemModalOpen(true)
  }

  const handleSaveMenuItem = async () => {
    try {
      setSaving(true)
      console.log('💾 Saving to PostgreSQL...')
      
      if (!menuItemForm.name?.trim()) {
        showToast('Please enter item name', 'error')
        return
      }
      if (!menuItemForm.price || parseFloat(menuItemForm.price) < 0) {
        showToast('Please enter valid price', 'error')
        return
      }
      if (!menuItemForm.category) {
        showToast('Please select a category', 'error')
        return
      }

      let imageUrl = editingItem?.image || '/placeholder-food.jpg'
      if (imageFile) {
        console.log('📤 Uploading image...')
        const uploadResult = await uploadMenuItemImage(imageFile)
        imageUrl = uploadResult.imageUrl
        console.log('✅ Image uploaded:', imageUrl)
      }

      // Find category name from ID
      const selectedCategory = categories.find(cat => cat.id === menuItemForm.category)
      const categoryName = selectedCategory ? selectedCategory.name : 'Other'

      // Format data to match backend expectations
      const itemData = {
        name: menuItemForm.name.trim(),
        description: menuItemForm.description?.trim() || '',
        price: parseFloat(menuItemForm.price), // Backend converts this to priceCents
        category: categoryName, // Backend expects category NAME, not ID
        stock: parseInt(menuItemForm.stock) || 0,
        availability: menuItemForm.availability, // Backend expects "In Stock" or "Out of Stock"
            image: imageUrl
          }
          
      console.log('💾 Saving item data:', itemData)
      console.log('📊 Availability value:', menuItemForm.availability)

      let savedItem
      if (editingItem) {
        console.log('🔄 Updating item ID:', editingItem.id)
        savedItem = await updateMenuItem(editingItem.id, itemData)
        console.log('✅ Updated in PostgreSQL. Response:', savedItem)
      } else {
        savedItem = await createMenuItem(itemData)
        console.log('✅ Created in PostgreSQL. Response:', savedItem)
      }

      // Close modals first
      showToast(editingItem ? 'Menu item updated successfully!' : 'Menu item created successfully!', 'success')
      setIsAddMenuItemModalOpen(false)
        setIsEditMenuItemModalOpen(false)
      setEditingItem(null)
      setImageFile(null)
      setImagePreview(null)
      
      // Force refetch with a small delay to ensure database has updated
      console.log('🔄 Refetching data from PostgreSQL...')
      await new Promise(resolve => setTimeout(resolve, 200))
      await fetchData()
      console.log('✅ UI updated with latest data')
        
      } catch (error) {
      console.error('❌ Save error:', error)
      showToast('Failed to save: ' + error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMenuItem = (itemId) => {
    showConfirmDialog(
      'Delete Menu Item',
      'Are you sure you want to delete this menu item? This action cannot be undone.',
      async () => {
        try {
          console.log('🗑️ Deleting from PostgreSQL...')
        await deleteMenuItem(itemId)
          console.log('✅ Deleted from PostgreSQL')
          showToast('Menu item deleted successfully!', 'success')
          closeConfirmDialog()
          await fetchData()
      } catch (error) {
          console.error('❌ Delete error:', error)
          showToast('Failed to delete: ' + error.message, 'error')
          closeConfirmDialog()
        }
      }
    )
  }

  // Category CRUD
  const handleAddCategory = () => {
    setCategoryForm({ name: '', image: null })
    setImageFile(null)
    setImagePreview(null)
    setEditingCategory(null)
    setIsAddCategoryModalOpen(true)
  }

  const handleEditCategory = (category) => {
    if (category.id === 'all') return
    setEditingCategory(category)
    setCategoryForm({ name: category.name, image: category.image })
    setImageFile(null)
    setImagePreview(category.image ? getImageUrl(category.image) : null)
    setIsEditCategoryModalOpen(true)
  }

  const handleSaveCategory = async () => {
    try {
      setSaving(true)
      console.log('💾 Saving category to PostgreSQL...')
      
      if (!categoryForm.name?.trim()) {
        showToast('Please enter category name', 'error')
        return
      }

      let imageUrl = editingCategory?.image || null
      if (imageFile) {
        console.log('📤 Uploading category image...')
        const uploadResult = await uploadCategoryImage(imageFile)
        imageUrl = uploadResult.imageUrl
        console.log('✅ Category image uploaded:', imageUrl)
      }

        const categoryData = {
        name: categoryForm.name.trim(),
          image: imageUrl
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData)
        console.log('✅ Category updated in PostgreSQL')
    } else {
        await createCategory(categoryData)
        console.log('✅ Category created in PostgreSQL')
      }

      showToast(editingCategory ? 'Category updated successfully!' : 'Category created successfully!', 'success')
      setIsAddCategoryModalOpen(false)
      setIsEditCategoryModalOpen(false)
      setEditingCategory(null)
      
      await fetchData()
      
          } catch (error) {
      console.error('❌ Save category error:', error)
      showToast('Failed to save category: ' + error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = (categoryId) => {
    showConfirmDialog(
      'Delete Category',
      'Are you sure you want to delete this category?',
      async () => {
        try {
          console.log('🗑️ Deleting category from PostgreSQL...')
          await deleteCategory(categoryId, false)
          console.log('✅ Category deleted from PostgreSQL')
          
          if (activeCategory === categoryId) {
            setActiveCategory('all')
          }
          
          showToast('Category deleted successfully!', 'success')
          closeConfirmDialog()
          await fetchData()
        } catch (error) {
          console.error('❌ Delete category error:', error)
          
          // Check if error has details (items blocking deletion)
          if (error.details && error.details.items) {
            closeConfirmDialog()
            
            // Show detailed error with items
            const itemsList = error.details.items
              .map(item => `• ${item.name} (${item.price})`)
              .join('\n');
            
            const confirmMessage = `❌ Cannot delete "${error.details.categoryName}"
            
This category has ${error.details.itemCount} menu item${error.details.itemCount > 1 ? 's' : ''}:

${itemsList}

⚠️ Choose an option:

1️⃣ Delete category AND all ${error.details.itemCount} item${error.details.itemCount > 1 ? 's' : ''} (CANNOT BE UNDONE)
2️⃣ Cancel and keep category

Do you want to DELETE EVERYTHING?`;
            
            showConfirmDialog(
              '⚠️ Cascade Delete Warning',
              confirmMessage,
              async () => {
                try {
                  console.log(`🗑️ Force deleting category with ${error.details.itemCount} items...`)
                  await deleteCategory(categoryId, true)
                  console.log('✅ Category and items deleted from PostgreSQL')
                  
                  if (activeCategory === categoryId) {
                    setActiveCategory('all')
                  }
                  
                  showToast(`Category and ${error.details.itemCount} items deleted successfully!`, 'success')
                  closeConfirmDialog()
                  await fetchData()
                } catch (forceError) {
                  console.error('❌ Force delete error:', forceError)
                  showToast('Failed to delete category: ' + forceError.message, 'error')
                  closeConfirmDialog()
                }
              }
            )
          } else {
            showToast('Failed to delete category: ' + error.message, 'error')
            closeConfirmDialog()
          }
        }
      }
    )
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const filteredMenuItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.categoryId === activeCategory)

  if (loading && menuItems.length === 0) {
  return (
      <Layout title="Menu">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 400,
          color: colors.muted 
        }}>
          Loading menu...
        </div>
      </Layout>
    )
  }

  return (
    <Layout 
          title="Menu" 
          showBackButton={true} 
      right={
            <>
          {/* Notification Bell */}
              <div 
                onClick={() => navigate('/notifications')}
                style={{ 
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <Bell size={20} color="#FFFFFF" />
              </div>

              {/* Separator Line */}
              <div style={{ 
                width: 0,
                height: 22.29,
                border: '0.742918px solid #FFFFFF',
                margin: '0 8px'
              }} />

              {/* User Profile */}
              <div 
                onClick={() => navigate('/profile')}
                style={{ 
                  width: 37.15,
                  height: 37.15,
                  borderRadius: '50%',
                  border: '1.48584px solid #FAC1D9',
                  background: '#D9D9D9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.borderColor = colors.accent
                }}
                onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.borderColor = '#FAC1D9'
                }}
              >
            {user?.profileImage ? (
                <img 
                src={user.profileImage} 
                  alt="Profile" 
                  style={{ 
                    width: '100%',
                    height: '100%',
                  objectFit: 'cover' 
                }} 
              />
            ) : (
            <div style={{ 
                width: '100%', 
                height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600, 
                color: '#666'
              }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </>
      }
    >
      {/* Category Management Buttons */}
              {canEditMenu() && (
        <div style={{
          display: 'flex',
          gap: 12,
          marginTop: 24,
          marginBottom: 20,
          justifyContent: 'flex-end'
        }}>
                <button 
            onClick={handleAddCategory}
                  style={{
                    background: colors.accent,
              color: '#000000',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 8,
                    cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(250, 193, 217, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E8A8C8'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(250, 193, 217, 0.5)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.accent
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(250, 193, 217, 0.3)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <FiPlus size={18} /> Add Category
                </button>

                <button
            onClick={() => {
              // Open manage categories modal
              setIsManageCategoriesModalOpen(true)
            }}
                  style={{
              background: colors.accent,
              color: '#000000',
                    border: 'none',
              padding: '10px 20px',
              borderRadius: 8,
                    cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
                    transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(250, 193, 217, 0.3)'
                  }}
                  onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E8A8C8'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(250, 193, 217, 0.5)'
              e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.accent
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(250, 193, 217, 0.3)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <FiEdit3 size={18} /> Edit Categories
                </button>
            </div>
      )}

      {/* Categories Section - Professional with Images */}
      <Categories 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={setActiveCategory}
        user={user}
        layout="horizontal"
        showAddButton={false}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Add Menu Item Button - Above Menu Items List */}
      {canEditMenu() && (
            <div style={{ 
              display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 16,
          marginTop: 24
        }}>
          <button
            onClick={handleAddMenuItem}
                  style={{ 
              background: colors.accent,
              color: '#000000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
                    cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(250, 193, 217, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E8A8C8'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(250, 193, 217, 0.5)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.accent
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(250, 193, 217, 0.3)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <FiPlus size={18} /> Add Menu Item
          </button>
              </div>
      )}

      {/* Menu Items List */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
        gap: 0
              }}>
        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map((item, index) => (
                  <div
              key={`${item.id}-${dataVersion}`}
                    style={{
                background: colors.panel,
                borderBottom: index < filteredMenuItems.length - 1 ? `1px solid ${colors.line}` : 'none',
                padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                gap: 12,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.inputBg}
              onMouseLeave={(e) => e.currentTarget.style.background = colors.panel}
            >
              {/* Checkbox (placeholder) */}
              <div style={{
                width: 18,
                height: 18,
                border: `2px solid ${colors.line}`,
                borderRadius: 4
              }} />

              {/* Image */}
                    <div style={{ 
                width: 80, 
                height: 60, 
                borderRadius: 8,
                      overflow: 'hidden',
                flexShrink: 0,
                background: colors.inputBg
                    }}>
                <img
                  src={getImageUrl(item.image)}
          alt={item.name}
                  onError={handleImageError}
          style={{ 
            width: '100%', 
            height: '100%', 
                    objectFit: 'cover'
          }}
        />
                    </div>
                    
              {/* Name & Description */}
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                          <div style={{ 
                  fontSize: 15, 
                  fontWeight: 600,
                            color: colors.text,
                            marginBottom: 4
                          }}>
                            {item.name}
                          </div>
                          <div style={{ 
                  fontSize: 13, 
                            color: colors.muted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                          }}>
                  {item.description || 'No description'}
                        </div>
                    </div>
                    
              {/* ID */}
                    <div style={{ 
                flex: '0 0 100px',
                fontSize: 13,
                color: colors.muted
              }}>
                #{item.id.slice(-6)}
                    </div>
                    
                    {/* Stock */}
                    <div style={{ 
                flex: '0 0 80px',
                      fontSize: 14, 
                color: colors.text
                    }}>
                {item.stock} Items
                    </div>
                    
                    {/* Category */}
                    <div style={{ 
                flex: '0 0 100px',
                      fontSize: 14, 
                color: colors.text
                    }}>
                      {item.category}
                    </div>
                    
                    {/* Price */}
                    <div style={{ 
                flex: '0 0 80px',
                fontSize: 16,
                fontWeight: 600,
                color: colors.accent
              }}>
                ${item.price}
                    </div>
                    
                    {/* Availability */}
                    <div style={{ 
                flex: '0 0 100px'
              }}>
                <span style={{ 
                  fontSize: 12,
                  padding: '4px 12px',
                  borderRadius: 12,
                  background: item.availability === 'In Stock' ? '#4caf5022' : '#ff6b6b22',
                  color: item.availability === 'In Stock' ? '#4caf50' : '#ff6b6b',
                  fontWeight: 500
                    }}>
                      {item.availability}
                </span>
                    </div>
                    
              {/* Actions */}
                      {canEditMenu() && (
                      <div style={{ 
                flex: '0 0 80px',
                        display: 'flex', 
                        gap: 8, 
                justifyContent: 'flex-end'
                      }}>
                            <button
                  onClick={() => handleEditMenuItem(item)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: colors.accent,
                                cursor: 'pointer',
                    padding: 6,
                                borderRadius: 6,
                                display: 'flex',
                                alignItems: 'center',
                    transition: 'background 0.2s'
                              }}
                  onMouseEnter={(e) => e.currentTarget.style.background = colors.inputBg}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  title="Edit"
                            >
                              <FiEdit3 size={16} />
                            </button>
                        {user?.role === 'ADMIN' && (
                            <button
                    onClick={() => handleDeleteMenuItem(item.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                      color: '#ff6b6b',
                                cursor: 'pointer',
                      padding: 6,
                                borderRadius: 6,
                                display: 'flex',
                                alignItems: 'center',
                      transition: 'background 0.2s'
                              }}
                    onMouseEnter={(e) => e.currentTarget.style.background = colors.inputBg}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                        )}
                      </div>
                      )}
                  </div>
          ))
        ) : (
          <div style={{ 
            background: colors.panel,
            padding: 60,
            textAlign: 'center',
            color: colors.muted,
            borderRadius: 10
          }}>
            <div style={{ fontSize: 16, marginBottom: 8 }}>No items found</div>
            <div style={{ fontSize: 14 }}>
              {activeCategory === 'all' 
                ? 'Add your first menu item to get started' 
                : 'No items in this category'}
              </div>
            </div>
        )}
      </div>

      {/* Add/Edit Menu Item Modal */}
      {(isAddMenuItemModalOpen || isEditMenuItemModalOpen) && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          background: 'rgba(0,0,0,0.8)',
            display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}
        onClick={() => {
          setIsAddMenuItemModalOpen(false)
          setIsEditMenuItemModalOpen(false)
        }}
        >
          <div style={{
              background: colors.panel,
            borderRadius: 12,
            padding: 32,
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <button
                onClick={() => {
                  setIsAddMenuItemModalOpen(false)
                  setIsEditMenuItemModalOpen(false)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.muted,
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Name *</label>
              <input
                type="text"
                value={menuItemForm.name}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                placeholder="e.g., Grilled Chicken"
                style={{
                  width: '100%',
                  padding: 12,
                  background: colors.inputBg,
                  border: `1px solid ${colors.line}`,
                  borderRadius: 8,
                  color: colors.text,
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Description</label>
              <textarea
                value={menuItemForm.description}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                placeholder="Brief description of the item"
                rows={3}
                style={{
                  width: '100%',
                  padding: 12,
                  background: colors.inputBg,
                  border: `1px solid ${colors.line}`,
                  borderRadius: 8,
                  color: colors.text,
                  fontSize: 14,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={menuItemForm.price}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, price: e.target.value })}
                  placeholder="0.00"
          style={{
                    width: '100%',
                    padding: 12,
                    background: colors.inputBg,
                    border: `1px solid ${colors.line}`,
                    borderRadius: 8,
                color: colors.text,
                    fontSize: 14
                  }}
                />
            </div>
            
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Stock</label>
              <input
                  type="number"
                  min="0"
                  value={menuItemForm.stock}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, stock: e.target.value })}
                  placeholder="0"
                style={{
                  width: '100%',
                    padding: 12,
                  background: colors.inputBg,
                    border: `1px solid ${colors.line}`,
                  borderRadius: 8,
                  color: colors.text,
                  fontSize: 14
                }}
              />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Category *</label>
              <select 
                value={menuItemForm.category}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: 12,
                  background: colors.inputBg,
                  border: `1px solid ${colors.line}`,
                  borderRadius: 8,
                  color: colors.text,
                  fontSize: 14
                }}
              >
                <option value="">Select Category</option>
                {categories.filter(cat => cat.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Availability</label>
              <select
                value={menuItemForm.availability}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, availability: e.target.value })}
                style={{
                  width: '100%',
                  padding: 12,
                  background: colors.inputBg,
                  border: `1px solid ${colors.line}`,
                  borderRadius: 8,
                  color: colors.text,
                  fontSize: 14
                }}
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  width: '100%',
                  padding: 12,
                  background: colors.inputBg,
                  border: `1px solid ${colors.line}`,
                  borderRadius: 8,
                  color: colors.text,
                  fontSize: 14
                }}
              />
              {imagePreview && (
                <div style={{ marginTop: 12, position: 'relative' }}>
                  <img
                    src={imagePreview}
                        alt="Preview"
                        style={{
                          width: '100%',
                      height: 200,
                          objectFit: 'cover',
                      borderRadius: 8
                    }}
              />
              <button 
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(0,0,0,0.7)',
                  border: 'none',
                      color: colors.text,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                  cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                }}
              >
                    <FiX size={18} />
              </button>
            </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setIsAddMenuItemModalOpen(false)
                  setIsEditMenuItemModalOpen(false)
                }}
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  background: colors.inputBg,
                  color: colors.text,
                  border: 'none',
                  borderRadius: 8,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                fontWeight: 500,
                  opacity: saving ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMenuItem}
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  background: colors.accent,
                  color: colors.bg,
                  border: 'none',
                  borderRadius: 8,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'Saving...' : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {(isAddCategoryModalOpen || isEditCategoryModalOpen) && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          background: 'rgba(0,0,0,0.8)',
            display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}
        onClick={() => {
          setIsAddCategoryModalOpen(false)
          setIsEditCategoryModalOpen(false)
        }}
        >
          <div style={{
              background: colors.panel,
            borderRadius: 12,
            padding: 32,
            width: '100%',
            maxWidth: 400
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => {
                  setIsAddCategoryModalOpen(false)
                  setIsEditCategoryModalOpen(false)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.muted,
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Name *</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Chicken, Pizza"
                style={{
                  width: '100%',
                  padding: 12,
                  background: colors.inputBg,
                  border: `1px solid ${colors.line}`,
                  borderRadius: 8,
                  color: colors.text,
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  width: '100%',
                  padding: 12,
                  background: colors.inputBg,
                  border: `1px solid ${colors.line}`,
                  borderRadius: 8,
                  color: colors.text,
                  fontSize: 14
                }}
              />
              {imagePreview && (
                <div style={{ marginTop: 12, position: 'relative' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                style={{
                  width: '100%',
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 8
                    }}
                  />
                  <button
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(0,0,0,0.7)',
                      border: 'none',
                  color: colors.text,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FiX size={18} />
                  </button>
            </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setIsAddCategoryModalOpen(false)
                  setIsEditCategoryModalOpen(false)
                }}
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  background: colors.inputBg,
                  color: colors.text,
                  border: 'none',
                  borderRadius: 8,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  opacity: saving ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  background: colors.accent,
                  color: colors.bg,
                  border: 'none',
                  borderRadius: 8,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Categories Modal */}
      {isManageCategoriesModalOpen && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          padding: 20
          }}
        onClick={() => setIsManageCategoriesModalOpen(false)}
        >
          <div style={{
              background: colors.panel,
            borderRadius: 12,
            padding: 32,
              width: '100%',
            maxWidth: 600,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                Manage Categories
              </h3>
              <button
                onClick={() => setIsManageCategoriesModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.muted,
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div style={{ marginBottom: 16, color: colors.muted, fontSize: 14 }}>
              Click on a category to edit or delete it
                  </div>

            {/* Categories List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {categories.filter(cat => cat.id !== 'all').map(category => (
                <div
                  key={category.id}
                      style={{
                        background: colors.inputBg,
                    borderRadius: 8,
                    padding: 16,
                        display: 'flex',
                        alignItems: 'center',
                    justifyContent: 'space-between',
                    border: `1px solid ${colors.line}`,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.line
                    e.currentTarget.style.borderColor = colors.accent
                      }}
                      onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.inputBg
                    e.currentTarget.style.borderColor = colors.line
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    {/* Category Image */}
                    {category.image && (
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: 8,
                        overflow: 'hidden',
                        background: colors.panel
                      }}>
                        <img
                          src={getImageUrl(category.image)}
                          alt={category.name}
                          onError={handleImageError}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        </div>
                      )}
                    
                    {/* Category Name and Count */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>
                                    {category.name}
                                  </div>
                      <div style={{ fontSize: 13, color: colors.muted }}>
                                    {category.count} items
                                  </div>
                                </div>
                              </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                              <button
                      onClick={() => {
                        handleEditCategory(category)
                        setIsManageCategoriesModalOpen(false)
                      }}
                                style={{
                                  background: colors.accent,
                        color: '#000000',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 13,
                                  fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                                  transition: 'all 0.2s ease'
                                }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#E8A8C8'}
                      onMouseLeave={(e) => e.currentTarget.style.background = colors.accent}
                              >
                      <FiEdit3 size={14} /> Edit
                              </button>
                              {user?.role === 'ADMIN' && (
                              <button
                      onClick={() => {
                        handleDeleteCategory(category.id)
                      }}
                                style={{
                                  background: 'transparent',
                        color: '#ff6b6b',
                        border: `1px solid #ff6b6b`,
                                  padding: '8px 16px',
                                  borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 13,
                                  fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ff6b6b'
                        e.currentTarget.style.color = '#FFFFFF'
                                }}
                                onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#ff6b6b'
                                }}
                              >
                      <FiTrash2 size={14} /> Delete
                              </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

            {/* Add New Category Button */}
              <button
              onClick={() => {
                setIsManageCategoriesModalOpen(false)
                handleAddCategory()
              }}
                style={{
                marginTop: 20,
                width: '100%',
                  background: 'transparent',
                color: colors.accent,
                border: `2px dashed ${colors.accent}`,
                padding: '16px',
                borderRadius: 8,
                  cursor: 'pointer',
                fontSize: 14,
                  fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(250, 193, 217, 0.1)'
                }}
                onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                }}
              >
              <FiPlus size={18} /> Add New Category
              </button>
                  </div>
                </div>
              )}

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
            <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
        onClick={closeConfirmDialog}
        >
          <div 
            style={{
              background: colors.panel,
              borderRadius: '12px',
              padding: '24px',
              width: '400px',
              maxWidth: '90%',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: colors.text
            }}>
              {confirmDialog.title}
            </h3>

            <p style={{
              margin: '0 0 24px 0',
              fontSize: '14px',
              color: colors.muted,
              lineHeight: '1.5'
            }}>
              {confirmDialog.message}
            </p>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeConfirmDialog}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: `1px solid ${colors.line}`,
                  borderRadius: '8px',
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.line
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Cancel
              </button>
                <button
                onClick={() => {
                  if (confirmDialog.onConfirm) {
                    confirmDialog.onConfirm()
                  }
                }}
                  style={{
                  padding: '10px 20px',
                  background: '#DC3545',
                    border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                    fontSize: '14px',
                  fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(220, 53, 69, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#C82333'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.6)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#DC3545'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.4)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Delete
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </Layout>
  )
}
