# GroupPay - Mobile Group Payment App

A React Native mobile application for managing group payments, deposits, and expenses with a clean, modern UI design.

## 🚀 Features

### 📱 Core Functionality
- **Group Management**: Create and manage payment groups with ease
- **Transactions**: Track all group transactions with detailed filtering
- **Deposits**: Handle deposits with multiple payment methods
- **Receipt Upload**: Upload bank transfer receipts with camera/gallery integration
- **Real-time Updates**: Live preview and instant feedback

### 🎨 UI/UX Highlights
- **Mobile-Native Design**: Optimized for mobile with proper touch targets
- **Cyan Theme**: Consistent #06b6d4 color scheme throughout
- **Smooth Navigation**: Stack and tab navigation with proper transitions
- **Keyboard Handling**: Proper keyboard avoidance and dismissal
- **Pull-to-Refresh**: Native refresh functionality on lists
- **Empty States**: Beautiful empty state designs with helpful messaging

### 📋 Screens
1. **Home Screen**: Dashboard with quick actions and overview cards
2. **Groups Screen**: FlatList of groups with filtering (Admin/Member)
3. **Transactions Screen**: Balance overview with date-based filtering
4. **Deposits Screen**: Deposit management with status filtering
5. **Create Group**: Simple group creation with live preview
6. **Create Deposit**: Enhanced deposit creation with receipt upload

## 🛠️ Tech Stack

- **React Native**: 0.81.5
- **Expo**: ~54.0.33
- **React Navigation**: v6 (Stack & Bottom Tabs)
- **Expo Vector Icons**: For consistent iconography
- **Expo Image Picker**: Camera and gallery integration
- **React Native Gesture Handler**: Smooth gesture interactions

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/GroupPay.git
   cd GroupPay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## 📱 Screenshots

*Screenshots will be added soon*

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CustomBottomTab.js
│   └── DashboardCard.js
├── navigation/          # Navigation configuration
│   ├── BottomTabNavigator.js
│   └── GroupsStackNavigator.js
├── screens/            # App screens
│   ├── HomeScreen.js
│   ├── GroupsScreen.js
│   ├── TransactionsScreen.js
│   ├── DepositsScreen.js
│   ├── CreateGroupScreen.js
│   └── CreateDepositScreen.js
└── styles/             # Style definitions
    ├── appStyles.js
    ├── homeStyles.js
    ├── customTabStyles.js
    └── screenStyles.js
```

## 🎯 Key Features Implementation

### Group Management
- Create groups with simple name input
- Live preview during creation
- FlatList implementation for performance
- Admin/Member filtering with chips

### Transaction System
- Balance overview cards (Credits, Debits, Net Balance)
- Date-based filtering (All Time, Today, Last 7 Days, etc.)
- Rich transaction cards with proper text wrapping
- Currency formatting with Rs symbol

### Deposit Functionality
- Multiple transaction types (Deposit, Withdrawal, Request)
- Various payment methods (Bank Transfer, Cash, Digital Wallet, Check)
- Receipt upload requirement for bank transfers
- Image picker with camera/gallery options
- Form validation and error handling

### Mobile Optimizations
- KeyboardAvoidingView for proper input handling
- TouchableWithoutFeedback for keyboard dismissal
- Proper ScrollView with keyboard persistence
- FlatList for large data sets
- Pull-to-refresh functionality

## 🔧 Configuration

### Navigation Setup
The app uses React Navigation v6 with:
- Bottom Tab Navigator for main sections
- Stack Navigator for detailed flows
- Proper header configurations
- Custom tab bar styling

### Styling Approach
- Consistent color scheme (#06b6d4 cyan theme)
- Mobile-first responsive design
- Shadow and elevation for depth
- Proper spacing and typography scale

## 🚀 Future Enhancements

- [ ] Backend API integration
- [ ] User authentication
- [ ] Push notifications
- [ ] Expense splitting algorithms
- [ ] Payment gateway integration
- [ ] Dark mode support
- [ ] Offline functionality
- [ ] Export functionality

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Muneeb Baloch**
- GitHub: [@Muneeb-baloch](https://github.com/yourusername)

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- React Navigation for smooth navigation solutions
- Community contributors and testers

---

**Note**: This is a demo application for learning purposes. For production use, implement proper backend integration, authentication, and security measures.