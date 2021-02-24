#
# Loads .csproj (or .Build.props) file passed in parameter as XML and changes it's version numbers (Version, FileVersion, AssemblyVersion)
#

param([String]$ProjectPath, [String]$VersionNum, [String]$FileVersionNum)

Write-Host ("SetVersionInCsproj script. Version 1.0.0. Copyright (c) 2017-2021 Korzh.com") 

$CurrentDir = Get-Location
Write-Host ("Working dir: " + $CurrentDir) 


if ([string]::IsNullOrEmpty($ProjectPath) -or [string]::IsNullOrEmpty($VersionNum)) {
	Write-Host ("Using: SetVersionInCsproj {path-to-csproj-file} {version} {file-version (optional)} ")
	Exit	
}

Write-Host ("") 

if (-not (Test-Path -Path $ProjectPath) ) {
    Write-Host ("ERROR: File not found [" + $ProjectPath + "]")
	Exit
}

Write-Host ("Processing " + $ProjectPath + "...") 

$wasChanged = $false

$proj = [xml](Get-Content $ProjectPath)

Write-Host ("Setting main version to " + $VersionNum ) 

$proj.GetElementsByTagName("Version") | foreach {
    $_."#text" = $VersionNum
	$wasChanged = $true
}


if (-Not [string]::IsNullOrEmpty($FileVersionNum) ) {
	Write-Host ("Setting assembly and file version to " + $PackageVersionNum ) 
   
	$proj.GetElementsByTagName("AssemblyVersion") | foreach {
		$_."#text" = $FileVersionNum
		$wasChanged = $true
	}

	$proj.GetElementsByTagName("FileVersion") | foreach {
		$_."#text" = $FileVersionNum
		$wasChanged = $true
	}
}


if ($wasChanged) {
	Write-Host ("The version numbers was set to " + $VersionNum + " / " + $FileVersionNum ) 
	$proj.Save($ProjectPath)
}

Write-Host ("DONE") 
Write-Host ("") 
Write-Host ("") 