<?php

namespace App\Helpers;

use App\Models\Menu as ModelsMenu;
use App\Models\Role;
use App\Models\RoleHasMenu;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class Menu
{
    public static function defaultTtl()
    {
        return (int)env('SESSION_LIFETIME', 120) * 60;
    }

    public static function refreshMenu($key)
    {
        Cache::forget($key);
    }

    public static function getAll()
    {
        $allMenu = Cache::remember('all_menu', self::defaultTtl(), function () {
            $parentMenu = ModelsMenu::with([
                    'sub_menu' => function($query) {
                        $query->defaultOrder();
                    }
                ])
                ->whereNull('parent_id')
                ->orderBy('position', 'asc')
                ->get();

            return self::getSubMenu($parentMenu);
        });

        return $allMenu;
    }

    public static function getSubMenu($parentMenu)
    {
        $sub_menu = collect([]);

        foreach ($parentMenu as $menu) {
            $subMenu = self::getSubMenu($menu->sub_menu);
            $menu->sub_menu = $subMenu->isNotEmpty() ? $subMenu : null;
            $sub_menu->push($menu);
        }

        return $sub_menu;
    }

    public static function getByRole()
    {
        $currentRouteName = Route::currentRouteName();

        $user = Auth::user();
        $roles = $user->getRoleNames();

        $isSupervisor = $roles->first(fn(string $value) => $value == "Supervisor") ? true : false;
        $isAdmin = $roles->first(fn(string $value) => $value == "Admin") ? true : false;
        $isUser = $roles->first(fn(string $value) => $value == "User") ? true : false;

        $isAdminOnly = $isAdmin && !$isUser;
        $isAdminUser = $isAdmin && $isUser;
        $isAccessingAdmin = Str::contains($currentRouteName, 'admin.');
        
        $roleName = "";
        if($isSupervisor) {
            $roleName = "Supervisor";
        } else if($isAdminOnly) {
            $roleName = "Admin";
        } else if($isAdminUser) {
            $roleName = $isAccessingAdmin ? "Admin" : "User";
        } else {
            $roleName = "User";
        }

        $allMenu = Cache::remember("{$roleName}_menu", self::defaultTtl(), function () use($roleName) {
            $role = Role::findByName($roleName);

            $menuRole = RoleHasMenu::with('menu')
                ->where('role_id', $role->id)
                ->get()
                ->sortBy(function ($item) {
                    return $item->menu->position;
                });
            
            $selectedMenuIds = $menuRole->map(fn($item) => $item->menu->id)->toArray();
            $menus = ModelsMenu::with('parent')
                ->whereIn('id', $selectedMenuIds)
                ->orWhereHas('sub_menu', function ($query) use ($selectedMenuIds) {
                    $query->whereIn('id', $selectedMenuIds);
                })
                ->orderBy('position', 'asc')
                ->get();
            $hierarchy = self::buildHierarchy($menus);

            return $hierarchy;
        });
        
        return $allMenu;
    }

    public static function buildHierarchy($menus, $parentId = null)
    {
        return $menus
            ->where('parent_id', $parentId)
            ->map(function ($menu) use ($menus) {
                $sub_menu = self::buildHierarchy($menus, $menu->id);
                $menu->sub_menu = $sub_menu->isNotEmpty() ? $sub_menu : null;

                return $menu;
            })
            ->values();
    }
}
