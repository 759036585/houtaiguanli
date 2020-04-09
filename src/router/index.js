import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    // 登录
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login/login')
  },
  {
    // 首页
    path: '/',
    component: () => import('@/views/Home'),
    redirect:'/welcome',
    children:[
      {
        // 首页欢迎页面
        path:'/welcome', component:() => import('@/views/Welcome/welcome'),
        meta: {title:'首页'}
      },
      {
        // 用户列表页面
        path:'/users', component:() => import('@/views/Users/users'),
        meta: {title:'用户列表'}
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 路由守卫拦截

router.beforeEach((to,from,next) => {
  if(to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if(!token) return next('/login')
  next()
}) 


export default router
