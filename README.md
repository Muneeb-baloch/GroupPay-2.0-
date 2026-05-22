# GroupPay — Mobile Group Payment App

A React Native mobile application for managing group payments, shared expenses, deposits, and scenes with a clean, modern UI built on a real backend API.

---

## Features

### Authentication
- Email/password login and signup
- Email OTP verification after signup
- Forgot password with reset token flow
- JWT-based session persistence via AsyncStorage
- Auto-login on app restart

### Groups
- Create and manage payment groups
- Admin and Member role separation
- Star/favorite groups
- Leave groups
- Real-time balance display per group
- Group filter on dashboard

### Transactions & Deposits
- Track all group transactions with filtering
- Deposit management with multiple payment methods
- Bank transfer receipt upload (camera/gallery)
- Date-based and type-based filtering

### Scenes
- Shared expense events (scenes)
- Participant breakdown with paid/owes status
- Swipe to edit or delete scenes

### Home Dashboard
- Personalized greeting with user's name
- Balance overview with group filter
- Recent scenes and expenses
- Favorite group quick access
- Quick action buttons (Create Group, Deposit, Scenes, Split Bill)

### UI/UX
- Mobile-native design with cyan theme (`#06b6d4`)
- Animated splash screen
- Smooth navigation transitions
- Pull-to-refresh on all lists
- Skeleton loading states
- Empty states with helpful messaging
- Keyboard handling on all input screens

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React Native 0.81.5 |
| Platform | Expo ~54.0.33 |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| Auth Storage | AsyncStorage |
| Icons | Expo Vector Icons |
| Gradients | Expo Linear Gradient |
| Image Picker | Expo Image Picker |
| Gestures | React Native Gesture Handler |
| Safe Area | React Native Safe Area Context |
| Backend | Express + Node.js (GroupPay API) |
| Database | Supabase Postgres |
| Auth | JWT Identity Provider |

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CustomBottomTab.js
│   └── DashboardCard.js
├── config/
│   └── api.js           # Base URL + apiCall helper
├── constants/
│   └── theme.js         # Colors, spacing, typography
├── context/
│   └── AuthContext.js   # Auth state context
├── navigation/          # Navigation configuration
│   ├── AuthNavigator.js
│   ├── BottomTabNavigator.js
│   ├── GroupsStackNavigator.js
│   └── ScenesStackNavigator.js
├── screens/             # App screens
│   ├── HomeScreen.js
│   ├── GroupsScreen.js
│   ├── CreateGroupScreen.js
│   ├── ManageGroupScreen.js
│   ├── TransactionsScreen.js
│   ├── DepositsScreen.js
│   ├── CreateDepositScreen.js
│   ├── ReceiptViewScreen.js
│   ├── ScenesScreen.js
│   ├── SceneDetailScreen.js
│   ├── ExpensesScreen.js
│   ├── LoginScreen.js
│   ├── SignupScreen.js
│   ├── VerifyEmailScreen.js
│   ├── ForgotPasswordScreen.js
│   ├── ResetPasswordScreen.js
│   └── SplashScreen.js
├── services/            # API service layer
│   ├── authService.js   # Auth API calls
│   └── groupsService.js # Groups API calls
├── styles/              # Shared styles
│   ├── appStyles.js
│   ├── authStyles.js
│   ├── customTabStyles.js
│   ├── dashboardStyles.js
│   ├── homeStyles.js
│   └── screenStyles.js
└── utils/
    └── helpers.js       # formatBalance, formatDate, normalizeGroup, etc.
```

---

## API

Backend: `http://grouppay-api.yousuf-dev.com`  
Docs: `http://grouppay-api.yousuf-dev.com/docs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/up/auth/login` | Login |
| POST | `/api/up/auth/signup` | Register |
| POST | `/api/up/auth/verify-email` | Verify OTP |
| POST | `/api/up/auth/forgot-password` | Request reset link |
| POST | `/api/up/auth/reset-password` | Reset with token |
| PATCH | `/api/up/auth/profile` | Update profile |
| GET | `/api/up/groups` | Get all groups |
| POST | `/api/up/groups` | Create group |
| GET | `/api/up/groups/:id` | Get group by ID |
| PATCH | `/api/up/groups/:id` | Update group |
| POST | `/api/up/groups/:id/star` | Toggle star |
| DELETE | `/api/up/groups/:id/leave` | Leave group |

---

## Installation

```bash
# Clone the repo
git clone https://github.com/Muneeb-baloch/GroupPay.git
cd GroupPay

# Install dependencies
npm install

# Start the dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## Future Enhancements

- [ ] Push notifications
- [ ] Expense splitting algorithms
- [ ] Payment gateway integration
- [ ] Dark mode
- [ ] Offline support
- [ ] Export to PDF/CSV

---

## Author

**Muneeb Baloch**
- GitHub: [@Muneeb-baloch](https://github.com/Muneeb-baloch)

---

## License

MIT License — see [LICENSE](LICENSE) for details.
