const modules = import.meta.glob('./use*.jsx', { eager: true })

export default Object.fromEntries(Object.entries(modules).map(([path, module]) => [path.match(/use\w+/)[0], module.default]))
