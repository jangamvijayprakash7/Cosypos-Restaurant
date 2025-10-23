import React from 'react'

const colors = {
  bg: '#111315',
  panel: '#292C2D',
  text: '#FFFFFF',
  accent: '#FAC1D9',
  muted: '#777979',
  line: '#3D4142',
  inputBg: '#3D4142',
}

// Dashboard Icon Component - Professional Design
const DashboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" fill="#FAC1D9" opacity="0.3" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" fill="#FAC1D9" opacity="0.3" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" fill="#FAC1D9" opacity="0.3" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" fill="#FAC1D9" opacity="0.3" />
  </svg>
)

// All Items Icon Component - Professional Design
const AllItemsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4.5" y="4.5" width="15" height="15" rx="3" fill="#FAC1D9" opacity="0.1" />
    <rect x="6" y="6" width="12" height="12" rx="1.5" fill="#FAC1D9" opacity="0.2" />
    <rect x="7.5" y="7.5" width="3" height="3" rx="0.75" fill="#FAC1D9" opacity="0.4" />
    <rect x="13.5" y="7.5" width="3" height="3" rx="0.75" fill="#FAC1D9" opacity="0.4" />
    <rect x="7.5" y="13.5" width="3" height="3" rx="0.75" fill="#FAC1D9" opacity="0.4" />
    <rect x="13.5" y="13.5" width="3" height="3" rx="0.75" fill="#FAC1D9" opacity="0.4" />
    <circle cx="12" cy="12" r="1.5" fill="#FAC1D9" opacity="0.6" />
  </svg>
)

// Pizza Icon Component - Professional Design
const PizzaIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#FAC1D9" opacity="0.2" />
    <path d="M12 3 L12 21" stroke="#FAC1D9" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 12 L21 12" stroke="#FAC1D9" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4.76 4.76 L19.24 19.24" stroke="#FAC1D9" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19.24 4.76 L4.76 19.24" stroke="#FAC1D9" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9" cy="7.5" r="1.5" fill="#FAC1D9" />
    <circle cx="15" cy="7.5" r="1.5" fill="#FAC1D9" />
    <circle cx="7.5" cy="12" r="1" fill="#FAC1D9" />
    <circle cx="16.5" cy="12" r="1.5" fill="#FAC1D9" />
    <circle cx="9" cy="16.5" r="1" fill="#FAC1D9" />
    <circle cx="15" cy="16.5" r="1.5" fill="#FAC1D9" />
  </svg>
)

// Burger Icon Component - Professional Design
const BurgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="16.5" width="18" height="4.5" rx="2" fill="#FAC1D9" opacity="0.3" />
    <rect x="4.5" y="13.5" width="15" height="3" rx="1.5" fill="#FAC1D9" opacity="0.5" />
    <rect x="6" y="10.5" width="12" height="2" rx="1" fill="#FAC1D9" opacity="0.7" />
    <rect x="4.5" y="7.5" width="15" height="1.5" rx="0.75" fill="#FAC1D9" />
    <rect x="6" y="4.5" width="12" height="2" rx="1" fill="#FAC1D9" opacity="0.8" />
    <circle cx="9" cy="9" r="0.75" fill="#FAC1D9" opacity="0.9" />
    <circle cx="15" cy="9" r="0.75" fill="#FAC1D9" opacity="0.9" />
  </svg>
)

// Chicken Icon Component - Professional Design
const ChickenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="13.5" rx="7.5" ry="6" fill="#FAC1D9" opacity="0.3" />
    <circle cx="12" cy="9" r="4.5" fill="#FAC1D9" opacity="0.5" />
    <polygon points="12,6 10.5,4.5 13.5,4.5" fill="#FAC1D9" opacity="0.7" />
    <circle cx="10.5" cy="8.25" r="0.75" fill="#FAC1D9" opacity="0.8" />
    <ellipse cx="7.5" cy="13.5" rx="3.75" ry="2.25" fill="#FAC1D9" opacity="0.4" />
    <ellipse cx="16.5" cy="13.5" rx="3.75" ry="2.25" fill="#FAC1D9" opacity="0.4" />
    <rect x="10.5" y="18" width="0.75" height="3" fill="#FAC1D9" opacity="0.6" />
    <rect x="12.75" y="18" width="0.75" height="3" fill="#FAC1D9" opacity="0.6" />
  </svg>
)

// Bakery Icon Component - Professional Design
const BakeryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="7.5" y="15" width="9" height="6" rx="1.5" fill="#FAC1D9" opacity="0.2" />
    <path d="M6 15 Q9 12 12 15 Q15 12 18 15" stroke="#FAC1D9" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <circle cx="12" cy="10.5" r="1.5" fill="#FAC1D9" opacity="0.6" />
    <rect x="9" y="13.5" width="0.75" height="1.5" fill="#FAC1D9" opacity="0.5" />
    <rect x="10.5" y="13.5" width="0.75" height="1.5" fill="#FAC1D9" opacity="0.5" />
    <rect x="12.75" y="13.5" width="0.75" height="1.5" fill="#FAC1D9" opacity="0.5" />
    <rect x="14.25" y="13.5" width="0.75" height="1.5" fill="#FAC1D9" opacity="0.5" />
  </svg>
)

// Beverage Icon Component - Professional Design
const BeverageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="7.5" y="6" width="9" height="12" rx="1.5" fill="#FAC1D9" opacity="0.2" />
    <rect x="9" y="7.5" width="6" height="9" fill="#FAC1D9" opacity="0.4" />
    <line x1="15" y1="4.5" x2="15" y2="9" stroke="#FAC1D9" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="10.5" y="10.5" width="1.5" height="1.5" fill="#FAC1D9" opacity="0.6" />
    <rect x="12.75" y="12" width="1.5" height="1.5" fill="#FAC1D9" opacity="0.6" />
    <rect x="11.25" y="14.25" width="1.5" height="1.5" fill="#FAC1D9" opacity="0.6" />
  </svg>
)

// Seafood Icon Component - Professional Design
const SeafoodIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="12" rx="6" ry="3.75" fill="#FAC1D9" opacity="0.3" />
    <path d="M6 12 Q3 9 4.5 12 Q3 15 6 12" fill="#FAC1D9" opacity="0.4" />
    <ellipse cx="16.5" cy="12" rx="3.75" ry="3" fill="#FAC1D9" opacity="0.3" />
    <circle cx="18" cy="10.5" r="0.75" fill="#FAC1D9" opacity="0.6" />
    <ellipse cx="9" cy="9" rx="2.25" ry="1.125" fill="#FAC1D9" opacity="0.5" />
    <ellipse cx="9" cy="15" rx="2.25" ry="1.125" fill="#FAC1D9" opacity="0.5" />
    <circle cx="10.5" cy="10.5" r="0.6" fill="#FAC1D9" opacity="0.6" />
    <circle cx="12" cy="12" r="0.6" fill="#FAC1D9" opacity="0.6" />
    <circle cx="10.5" cy="13.5" r="0.6" fill="#FAC1D9" opacity="0.6" />
  </svg>
)

// Function to get category icon (keeping for compatibility)
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'All': <AllItemsIcon />,
    'All Items': <AllItemsIcon />,
    'Chicken': <ChickenIcon />,
    'Pizza': <PizzaIcon />,
    'Burger': <BurgerIcon />,
    'Beverage': <BeverageIcon />,
    'Dessert': <BakeryIcon />,
    'Salad': <BakeryIcon />,
    'Soup': <BakeryIcon />,
    'Pasta': <BakeryIcon />,
    'Seafood': <SeafoodIcon />,
    'Vegetarian': <BakeryIcon />,
    'Bakery': <BakeryIcon />
  };
  return iconMap[categoryName] || <DashboardIcon />;
}

// Function to get category image
const getCategoryImage = (categoryName) => {
  const imageMap = {
    'All': '/demo-cosypos.png',
    'All Items': '/demo-cosypos.png',
    'Chicken': '/grill chicken.jpg',
    'Pizza': '/pizza.jpg',
    'Burger': '/burger.jpg',
    'Beverage': '/orange juice.jpg',
    'Dessert': '/choclate cake.jpg',
    'Salad': '/placeholder-food.jpg',
    'Soup': '/placeholder-food.jpg',
    'Pasta': '/placeholder-food.jpg',
    'Seafood': '/salamon.jpg',
    'Vegetarian': '/placeholder-food.jpg',
    'Bakery': '/apple pie.jpg'
  };
  return imageMap[categoryName] || '/placeholder-food.jpg';
}

// Category Button Component for horizontal layout
const CategoryButton = ({ category, isActive, onClick, user }) => {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '140px',
      flex: '0 0 140px',
      paddingTop: '4px',
      paddingBottom: '4px'
    }}>
      <button
        onClick={() => onClick(category.id)}
        style={{
          background: isActive ? colors.accent : colors.panel,
          color: isActive ? '#333' : colors.text,
          border: isActive ? `2px solid ${colors.accent}` : `1px solid ${colors.line}`,
          padding: '12px 8px',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          height: '95px',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 500,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          boxShadow: isActive 
            ? '0 4px 15px rgba(250, 193, 217, 0.3)' 
            : '0 2px 8px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.target.style.background = '#3D4142'
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'
            e.target.style.borderColor = colors.accent
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.target.style.background = colors.panel
            e.target.style.transform = 'translateY(0px)'
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            e.target.style.borderColor = colors.line
          }
        }}
      >
        {/* Count Badge - Top Right */}
        <div style={{ 
          position: 'absolute',
          top: 6,
          right: 6,
          fontSize: 10, 
          background: isActive ? 'rgba(0,0,0,0.15)' : 'rgba(250, 193, 217, 0.8)',
          color: isActive ? '#333' : '#333',
          padding: '2px 6px',
          borderRadius: '8px',
          fontWeight: 600,
          minWidth: '18px',
          textAlign: 'center',
          lineHeight: 1.2
        }}>
          {category.count}
        </div>
        
        {/* Category Image */}
        <div style={{ 
          width: '50px',
          height: '50px',
          opacity: isActive ? 1 : 0.8,
          transition: 'all 0.2s ease',
          marginTop: '6px',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src={category.image || getCategoryImage(category.name)} 
            alt={category.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            onError={(e) => {
              e.target.src = '/placeholder-food.jpg'
            }}
          />
        </div>
        
        {/* Category Name */}
        <span style={{ 
          fontWeight: 600,
          fontSize: '12px',
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.1px',
          padding: '0 8px',
          marginTop: '4px'
        }}>
          {category.name}
        </span>
      </button>
    </div>
  )
}

// Category Card Component for grid layout
const CategoryCard = ({ name, itemCount, icon: Icon, isSelected, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      background: isSelected ? colors.accent : colors.panel,
      borderRadius: 8,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      minHeight: 100,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: isSelected ? `2px solid ${colors.accent}` : '2px solid transparent',
      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
    }}
    onMouseEnter={(e) => {
      if (!isSelected) {
        e.target.style.background = '#3D4142';
        e.target.style.transform = 'scale(1.02)';
      }
    }}
    onMouseLeave={(e) => {
      if (!isSelected) {
        e.target.style.background = colors.panel;
        e.target.style.transform = 'scale(1)';
      }
    }}
  >
    <Icon color={isSelected ? '#333333' : colors.accent} />
    <div style={{ 
      fontSize: 14, 
      fontWeight: 500, 
      color: isSelected ? '#333333' : colors.text 
    }}>
      {name}
    </div>
    <div style={{ 
      fontSize: 12, 
      color: isSelected ? '#333333' : colors.muted 
    }}>
      {itemCount} items
    </div>
  </div>
)

// Main Categories Component
const Categories = ({ 
  categories, 
  activeCategory, 
  onCategoryClick, 
  user, 
  layout = 'horizontal', // 'horizontal' or 'grid'
  showAddButton = false,
  onAddCategory = null,
  onEditCategory = null,
  onDeleteCategory = null
}) => {
  return (
    <div style={{ marginBottom: 16 }} data-categories-container>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 16,
        marginTop: 24,
        paddingBottom: 12,
        borderBottom: `1px solid ${colors.line}`,
        flexWrap: 'nowrap'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          flexWrap: 'nowrap'
        }}>
          <h2 style={{ 
            fontSize: 22, 
            fontWeight: 700, 
            color: colors.text,
            margin: 0,
            letterSpacing: '-0.5px',
            whiteSpace: 'nowrap'
          }}>
            Categories
          </h2>
          <div style={{
            fontSize: 12,
            color: colors.muted,
            background: 'rgba(255,255,255,0.05)',
            padding: '4px 8px',
            borderRadius: 6,
            whiteSpace: 'nowrap'
          }}>
            {categories.length} categories
          </div>
        </div>
        {showAddButton && (user?.role === 'ADMIN' || user?.role === 'STAFF') && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>            <button 
              onClick={() => onEditCategory && onEditCategory('bulk')}
              style={{
                background: 'transparent',
                color: colors.text,
                border: `1px solid ${colors.line}`,
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = colors.line;
                e.target.style.borderColor = colors.accent;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = colors.line;
              }}
            >
              Edit Categories
            </button>
            {user?.role === 'ADMIN' && onAddCategory && (
              <button 
                onClick={onAddCategory}
                style={{
                  background: colors.accent,
                  color: '#333',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#E8A8C8'}
                onMouseLeave={(e) => e.target.style.background = colors.accent}
              >
                Add New Category
              </button>
            )}
          </div>
        )}
      </div>
      
      {layout === 'horizontal' ? (
        <div style={{ 
          display: 'flex', 
          gap: 16,
          paddingBottom: 12,
          marginLeft: 0,
          marginRight: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingRight: 12,
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.line} transparent`,
          alignItems: 'flex-start'
        }}>
          <style>
            {`
              div::-webkit-scrollbar {
                height: 8px;
              }
              div::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
              }
              div::-webkit-scrollbar-thumb {
                background: ${colors.line};
                border-radius: 4px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: ${colors.muted};
              }
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            `}
          </style>
          {categories.map((category, index) => (
            <CategoryButton
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onClick={onCategoryClick}
              user={user}
            />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          paddingBottom: 16
        }}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              itemCount={category.count}
              icon={category.icon}
              isSelected={activeCategory === category.id}
              onClick={() => onCategoryClick(category.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Categories
export { getCategoryIcon, getCategoryImage, PizzaIcon, BurgerIcon, ChickenIcon, BakeryIcon, BeverageIcon, SeafoodIcon }
