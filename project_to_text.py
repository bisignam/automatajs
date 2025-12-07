import os

root = "."   # <-- update this
output = "./automata_dump_latest.txt"

# Folders to skip entirely
SKIP_DIRS = {
    "node_modules",
    "dist",
    "build",
    "out",
    "coverage",
    "tmp",
    "temp",
    "__pycache__",
    ".git",
    ".idea",
    ".vscode",
    ".cursor",
    ".angular",
    ".cache",
    ".husky"
}

def is_hidden(path):
    # Detects any .hidden folder or file in the path
    parts = path.split(os.sep)
    return any(p.startswith('.') for p in parts)

with open(output, "w", encoding="utf-8") as out:
    for folder, dirs, files in os.walk(root):

        # Remove skipped directories from traversal
        dirs[:] = [
            d for d in dirs
            if d not in SKIP_DIRS and not d.startswith(".")
        ]

        # Skip this folder entirely if hidden or in SKIP_DIRS
        basename = os.path.basename(folder)
        if basename in SKIP_DIRS or basename.startswith("."):
            continue

        for f in files:
            # Skip hidden files and weird system files
            if f.startswith("."):
                continue

            file_path = os.path.join(folder, f)

            # Extra safety: skip file if path contains a skip directory
            if any(skip in file_path.split(os.sep) for skip in SKIP_DIRS):
                continue

            out.write("\n\n===== FILE: " + file_path + " =====\n\n")

            try:
                with open(file_path, "r", encoding="utf-8") as src:
                    out.write(src.read())
            except:
                out.write("[[BINARY OR NON-TEXT FILE]]")

