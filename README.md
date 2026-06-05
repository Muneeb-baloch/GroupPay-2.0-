# GroupPay

A React Native mobile app for splitting bills, managing group payments, tracking shared expenses, and settling balances — built on a real REST API backend.

---

## Features

### Authentication
- Email/password signup and login
- Email OTP verification on signup
- Forgot password with OTP-based reset flow
- JWT session persistence via AsyncStorage
- Auto-login on app restart
- Profile management (name, avatar, password change)

### Groups
- Create and manage payment groups with custom colors
- Admin and Member role separation throughout the app
- Star/favorite groups for quick home screen access
- Invite members via email with queued invite support
- Manage member roles and remove members (admin only)
- Leave groups
- Live balance fetch per group (`my-balance` endpoint)
- Live member count fetch per group

### Scenes (Shared Outings)
- Create scenes for shared outings (dinners, trips, etc.)
- Two split modes: **Sharing** (equal split with optional add-ons) and **Individual** (custom per-person amounts)
- Per-participant paid amount tracking
- Swipe to edit or delete (admin only)
- Receipt image upload (camera or gallery)
- Location picker with map view
- Date/time picker
- Scene detail view with participant breakdown and your share
- Appeal system — members can raise disputes on scenes; admins can resolve or reject

### Transactions & Deposits
- Full transaction history per group with type and date filtering
- Deposit requests with multiple payment methods (bank transfer, cash, etc.)
- Bank transfer receipt upload
- Admin approval/rejection of deposits
- Balance summary card per group

### Notifications
- Real-time notification feed with unread badge count
- Mark individual or all notifications as read
- Tap to navigate directly to the relevant screen (deposit → Deposits, transaction → Transactions, group → Groups)

### Personal Expenses
- Log personal expenses with amount, type, location, and notes
- Date range filtering and type filtering
- Stats overview (total spent, count)

### Home Dashboard
- Personalized greeting with user's name
- Favorite group card with live balance and member count
- Recent scenes list
- Recent transactions list
- Quick action buttons

### UI/UX
- Full dark mode and light mode with persistent preference
- Cyan primary theme (`#06b6d4`)
- Animated Lottie splash screen
- Skeleton loading states on all lists
- Pull-to-refresh
- Swipeable list items (react-native-gesture-handler)
- Empty states with actionable prompts
- Keyboard-aware inputs across all forms

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native 0.85.3 |
| Platform | Expo ^56.0.0 |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| Auth Storage | AsyncStorage |
| Icons | @expo/vector-icons |
| Animations | Lottie React Native |
| Gradients | expo-linear-gradient |
| Image Picker | expo-image-picker |
| Location | expo-location |
| Gestures | react-native-gesture-handler |
| Safe Area | react-native-safe-area-context |
| Backend | Express + Node.js |
| Database | Supabase Postgres |
| Auth | JWT |

---

## Project Structure

```
GroupPay/
├── App.js                        # Root navigator + auth gate
├── app.json                      # Expo config
├── index.js                      # Entry point
├── .env                          # Local env vars (gitignored)
├── .env.example                  # Env template
└── src/
    ├── components/
    │   ├── home/
    │   │   ├── FavoriteGroupCard.js
    │   │   ├── RecentExpenseCard.js
    │   │   └── RecentSceneCard.js
    │   ├── scenes/
    │   │   └── CreateSceneHeader.js
    │   ├── ActionFooter.js
    │   ├── CustomBottomTab.js
    │   ├── DashboardCard.js
    │   └── PillSelector.js
    ├── config/
    │   └── api.js                # BASE_URL, API_ENDPOINTS, apiCall helper
    ├── context/
    │   ├── AuthContext.js        # JWT auth state, login/logout
    │   └── ThemeContext.js       # Dark/light mode, color tokens
    ├── navigation/
    │   ├── AuthNavigator.js
    │   ├── BottomTabNavigator.js
    │   ├── GroupsStackNavigator.js
    │   └── ScenesStackNavigator.js
    ├── screens/
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
    │   ├── CreateSceneScreen.js
    │   ├── ExpensesScreen.js
    │   ├── NotificationsScreen.js
    │   ├── ProfileScreen.js
    │   ├── LoginScreen.js
    │   ├── SignupScreen.js
    │   ├── VerifyEmailScreen.js
    │   ├── ForgotPasswordScreen.js
    │   ├── ResetPasswordScreen.js
    │   └── SplashScreen.js
    ├── services/
    │   ├── appealsService.js
    │   ├── authService.js
    │   ├── balancesService.js
    │   ├── depositsService.js
    │   ├── expensesService.js
    │   ├── filesService.js
    │   ├── groupsService.js
    │   ├── invitesService.js
    │   ├── notificationsService.js
    │   ├── queuedInvitesService.js
    │   ├── scenesService.js
    │   ├── transactionsService.js
    │   └── usersService.js
    ├── styles/
    │   ├── home/
    │   │   └── homeScreenStyles.js
    │   ├── scenes/
    │   │   └── createSceneStyles.js
    │   ├── authStyles.js
    │   ├── dashboardStyles.js
    │   └── homeStyles.js
    └── utils/
        ├── cache.js              # AsyncStorage TTL cache
        └── helpers.js            # getInitials, formatBalance, etc.
```

---

## Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
EXPO_PUBLIC_API_URL=http://your-api-server:5000
```

The app falls back to the development server URL if the variable is not set.

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Muneeb-baloch/GroupPay.git
cd GroupPay

# Install dependencies
npm install

# Create your env file
cp .env.example .env

# Start the Expo dev server
npm start

# Run on a device/simulator
npm run ios       # iOS
npm run android   # Android
```

---

## API Reference

Base URL: configured via `EXPO_PUBLIC_API_URL` in `.env`

All protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/up/auth/login` | Login |
| POST | `/api/up/auth/signup` | Register |
| POST | `/api/up/auth/verify-email` | OTP verify |
| POST | `/api/up/auth/forgot-password` | Request OTP |
| POST | `/api/up/auth/reset-password` | Reset password |
| GET/PATCH | `/api/up/auth/profile` | Get/update profile |
| POST | `/api/up/auth/change-password` | Change password |
| GET/POST | `/api/up/groups` | List / create groups |
| GET/PATCH | `/api/up/groups/:id` | Get / update group |
| GET | `/api/up/groups/:id/members` | Group member list |
| POST | `/api/up/groups/:id/star` | Toggle star |
| DELETE | `/api/up/groups/:id/leave` | Leave group |
| GET | `/api/up/groups/:id/my-balance` | My balance in group |
| GET/POST | `/api/up/scenes` | List / create scenes |
| GET/PATCH/DELETE | `/api/up/scenes/:id` | Scene detail / edit / delete |
| GET/POST | `/api/up/deposits` | List / create deposits |
| PATCH | `/api/up/deposits/:id/status` | Approve / reject deposit |
| GET | `/api/up/transactions` | Transaction history |
| GET/POST | `/api/up/expenses` | List / create expenses |
| GET | `/api/up/expenses/stats` | Expense statistics |
| GET/POST | `/api/up/invites` | List / send invites |
| PATCH | `/api/up/invites/:id/status` | Accept / decline invite |
| GET/POST | `/api/up/appeals` | List / create appeals |
| PATCH | `/api/up/appeals/:id` | Update appeal status |
| GET | `/api/up/notifications` | Notification list |
| PATCH | `/api/up/notifications/:id/read` | Mark as read |
| PATCH | `/api/up/notifications/read-all` | Mark all read |
| POST | `/api/up/files/upload` | Upload file (receipt/avatar) |

---

## Author

**Muneeb Baloch**
- GitHub: [@Muneeb-baloch](https://github.com/Muneeb-baloch)

---

## License

MIT License — see [LICENSE](LICENSE) for details.
