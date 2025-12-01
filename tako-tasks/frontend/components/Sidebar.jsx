export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 px-6 py-8">
      <h1 className="text-xl font-semibold text-indigo-600 mb-8">Tako Tasks</h1>

      <nav className="flex flex-col space-y-4 text-gray-700">
        <a className="hover:text-indigo-600 cursor-pointer">Dashboard</a>
        <a className="hover:text-indigo-600 cursor-pointer">My Tasks</a>
        <a className="hover:text-indigo-600 cursor-pointer">Team Tasks</a>
        <a className="hover:text-indigo-600 cursor-pointer">Settings</a>
      </nav>
    </aside>
  )
}
